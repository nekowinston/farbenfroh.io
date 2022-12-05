pub mod custom_lab;

#[macro_use]
extern crate lazy_static;

use crate::custom_lab::Lab;
use deltae::{DEMethod, DeltaE};
use image::buffer::Pixels;
use image::{ImageBuffer, Rgba, RgbaImage};
use rayon::prelude::*;
use wasm_bindgen::prelude::*;
pub use wasm_bindgen_rayon::init_thread_pool;

lazy_static! {
    static ref METHOD_STRINGS: std::collections::HashMap<String, DEMethod> = {
        let mut m = std::collections::HashMap::new();
        m.insert("1976".to_string(), DEMethod::DE1976);
        m.insert("1994g".to_string(), DEMethod::DE1994T);
        m.insert("1994t".to_string(), DEMethod::DE1994T);
        m.insert("2000".to_string(), DEMethod::DE2000);
        m
    };
}

const MAX_CHUNK_SIZE: usize = 3000000;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    #[cfg(debug_assertions)]
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

    // convert the user's RGB palette to LAB values
    let pallete_labs = convert_palette_to_lab(palette);

    // convert the RGBA pixels in the image to LAB values
    let img_labs = rgba_pixels_to_labs(img.pixels());

    #[cfg(debug_assertions)]
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
    let chunking = multithreading && img_labs.len() > MAX_CHUNK_SIZE;

    if chunking {
        convert_by_chunking(img_labs, method, &pallete_labs)
    } else {
        convert(&img_labs, method, &pallete_labs, multithreading)
    }
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
    *METHOD_STRINGS.get(&method).unwrap_or(&DEMethod::DE1994G)
}

pub fn convert_by_chunking(
    img_labs: Vec<Lab>,
    method: DEMethod,
    pallete_labs: &Vec<Lab>,
) -> Vec<u8> {
    // split into smaller vector copies; will it perform better with readonly slices?
    let img_labs_chunks: Vec<Vec<Lab>> =
        img_labs.chunks(MAX_CHUNK_SIZE).map(|s| s.into()).collect();

    #[cfg(debug_assertions)]
    log(&format!(
        "Created {} chunks of max {} pixels",
        img_labs_chunks.len(),
        MAX_CHUNK_SIZE
    ));

    // process chunks sequentially whereas each chunk is converted in parallel using rayon
    let result: Vec<Vec<u8>> = img_labs_chunks
        .iter()
        .map(|img_labs| convert(img_labs, method, pallete_labs, true))
        .collect();

    result.concat()
}

pub fn convert(
    img_labs: &Vec<Lab>,
    method: DEMethod,
    pallete_labs: &Vec<Lab>,
    multithreading: bool,
) -> Vec<u8> {
    // loop over each LAB in the LAB-converted image:
    // benchmarks have shown that only DeltaE 2000 benefits from parallel processing with rayon

    if multithreading {
        #[cfg(debug_assertions)]
        log(&format!(
            "multithreading using {} threads",
            rayon::current_num_threads()
        ));

        img_labs
            .par_iter()
            .flat_map(|lab| convert_loop(method, pallete_labs, lab))
            .collect()
    } else {
        #[cfg(debug_assertions)]
        log("not multithreading");

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
            closest_color.alpha = lab.alpha;
            closest_distance = *delta.value()
        }
    }

    // convert the LAB back to RGBA
    closest_color.to_rgba()
}
