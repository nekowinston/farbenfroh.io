pub mod custom_lab;

use crate::custom_lab::Lab;
use deltae::{DEMethod, DeltaE};
use image::buffer::Pixels;
use image::{ImageBuffer, Rgba, RgbaImage};
use rayon::prelude::*;
use wasm_bindgen::prelude::*;
pub use wasm_bindgen_rayon::init_thread_pool;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(msg: &str);
}

#[wasm_bindgen]
pub fn process(
    buffer: Vec<u8>,
    width: u32,
    height: u32,
    method: String,
    palette: &[u32],
    multithreading: u8,
) -> Vec<u8> {
    // RGBA, because ImageData always has 4 values for each pixel, R G B A
    // we'll drop the 4th (alpha) later, so it's not used.
    let img: RgbaImage = ImageBuffer::from_vec(width, height, buffer).unwrap();
    // parse the deltaE method
    let method = parse_delta_e_method(method);
    // convert the user's RGB palette to LAB
    let pallete_labs = convert_palette_to_lab(palette);
    // convert the RGBA pixels in the image to LAB values
    let img_labs = rgba_pixels_to_labs(img.pixels());

    log(&format!(
        "Method: {}. Using multithreading: {}",
        method,
        match multithreading {
            0 => "off",
            1 => "smart",
            2 => "always",
            _ => "unknown",
        }
    ));

    let multithreading = multithreading == 2 || (multithreading == 1 && method == DEMethod::DE2000);

    convert(&img_labs, method, &pallete_labs, multithreading)
}

pub fn convert_palette_to_lab(palette: &[u32]) -> Vec<Lab> {
    palette
        .iter()
        .map(|color| {
            let r = ((color >> 16) & 0xFF) as u8;
            let g = ((color >> 8) & 0xFF) as u8;
            let b = (color & 0xFF) as u8;
            Lab::from_rgb(&[r, g, b])
        })
        .collect()
}

pub fn parse_delta_e_method(method: String) -> DEMethod {
    match method.as_str() {
        "76" => deltae::DE1976,
        "94t" => deltae::DE1994T,
        "94g" => deltae::DE1994G,
        "2000" => deltae::DE2000,
        _ => deltae::DE1994G,
    }
}

pub fn convert(img_labs: &Vec<Lab>, method: DEMethod, pallete_labs: &Vec<Lab>, multithreading: bool) -> Vec<u8> {

    // chunk of size greater than max_chunk_size crash parallel processing in wasm (observation)
    let max_chunk_size = 3000000;

    // split into smaller chunks; can we do better using slices intead of allocating new copies?
    let img_labs_chunks: Vec<Vec<Lab>> = img_labs.chunks(max_chunk_size).map(|s| s.into()).collect();

    log(&format!(
        "Created {} chunks of max {} pixels",
        img_labs_chunks.len(),
        max_chunk_size
    ));

    // process chunks sequentially whereas each chunk is converted in parallel using rayon
    let result: Vec<Vec<u8>> = img_labs_chunks
        .iter()
        .map(|img_labs| convert_chunk(img_labs, method, &pallete_labs, multithreading))
        .collect();

    let result = result.concat();

    log("conversion done");

    return result;
}

pub fn convert_chunk(img_labs: &Vec<Lab>, method: DEMethod, pallete_labs: &Vec<Lab>, multithreading: bool) -> Vec<u8> {

    // loop over each LAB in the LAB-converted image:
    // benchmarks have shown that only DeltaE 2000 benefits from parallel processing with rayon

    if multithreading {
        log(&format!("processing new chunk using {} threads", rayon::current_num_threads()));
        img_labs
            .par_iter()
            .flat_map(|lab| convert_loop(method, pallete_labs, lab))
            .collect()
    } else {
        log("processing new chunk using a single thread");
        img_labs
            .iter()
            .flat_map(|lab| convert_loop(method, pallete_labs, lab))
            .collect()
    }
}

pub fn rgba_pixels_to_labs(img_pixels: Pixels<Rgba<u8>>) -> Vec<Lab> {
    img_pixels.map(|pixel| Lab::from_rgba(&pixel.0)).collect()
}

pub fn convert_loop(method: DEMethod, palette: &Vec<Lab>, lab: &Lab) -> [u8; 4] {
    // keep track of the closest color
    let mut closest_color: Lab = Default::default();
    // keep track of the closest distance measured, initially set as high as possible
    let mut closest_distance: f32 = f32::INFINITY;

    // loop over each LAB in the user's palette, and find the closest color
    for color in palette {
        let delta = DeltaE::new(*lab, *color, method);

        if delta.value() < &closest_distance {
            closest_color = *color;
            closest_distance = *delta.value();
        }
    }

    // convert the LAB back to RGBA
    closest_color.to_rgba()
}
