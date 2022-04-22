pub mod custom_lab;

use crate::custom_lab::Lab;
use deltae::{DEMethod, DeltaE};
use image::buffer::Pixels;
use image::{EncodableLayout, ImageBuffer, Rgba, RgbaImage};
use rayon::prelude::*;
use wasm_bindgen::prelude::*;
use wasm_bindgen::{Clamped, JsCast};
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

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
    palette: &[u8],
    target_canvas: String,
) {
    // RGBA, because ImageData always has 4 values for each pixel, R G B A
    // we'll drop the 4th (alpha) later, so it's not used.
    let img: RgbaImage = ImageBuffer::from_vec(width, height, buffer).unwrap();

    // parse the deltaE method
    let convert_method = parse_delta_e_method(method);
    // convert the user's RGB palette to LAB
    let labs = convert_palette_to_lab(palette);

    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id(&target_canvas).unwrap();
    let canvas: web_sys::HtmlCanvasElement = canvas
        .dyn_into::<HtmlCanvasElement>()
        .map_err(|_| ())
        .unwrap();

    canvas.set_width(width);
    canvas.set_height(height);

    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<CanvasRenderingContext2d>()
        .unwrap();

    let buffer_data = convert(img, convert_method, &labs);

    let data = buffer_data.as_bytes();
    let data = ImageData::new_with_u8_clamped_array_and_sh(Clamped(data), width, height).unwrap();
    context.put_image_data(&data, 0 as f64, 0 as f64).unwrap();
}

pub fn convert_palette_to_lab(palette: &[u8]) -> Vec<Lab> {
    let mut labs = vec![];
    for (i, _e) in palette.iter().enumerate().step_by(3) {
        let val1 = palette[i + 0];
        let val2 = palette[i + 1];
        let val3 = palette[i + 2];
        labs.push(Lab::from_rgb(&[val1, val2, val3]));
    }
    return labs;
}

pub fn parse_delta_e_method(method: String) -> DEMethod {
    return match method.as_str() {
        "76" => deltae::DE1976,
        "94t" => deltae::DE1976,
        "94g" => deltae::DE1976,
        "2000" => deltae::DE1976,
        _ => deltae::DE1976,
    };
}

pub fn convert(img: RgbaImage, convert_method: DEMethod, labs: &Vec<Lab>) -> Vec<u8> {
    // convert the RGBA pixels in the image to LAB values
    let img_labs = rgba_pixels_to_labs(img.pixels());

    // loop over each LAB in the LAB-converted image:
    // benchmarks have shown that only DeltaE 2000 benefits from parallel processing with rayon
    return if convert_method != DEMethod::DE2000 {
        img_labs
            .iter()
            .map(|lab| convert_loop(convert_method, labs, lab))
            .flatten()
            .collect()
    } else {
        img_labs
            .par_iter()
            .map(|lab| convert_loop(convert_method, labs, lab))
            .flatten()
            .collect()
    };
}

pub fn rgba_pixels_to_labs(img_pixels: Pixels<Rgba<u8>>) -> Vec<Lab> {
    img_pixels.map(|pixel| Lab::from_rgba(&pixel.0)).collect()
}

pub fn convert_loop(convert_method: DEMethod, palette: &Vec<Lab>, lab: &Lab) -> [u8; 4] {
    // keep track of the closest color
    let mut closest_color: Lab = Default::default();
    // keep track of the closest distance measured, initially set as high as possible
    let mut closest_distance: f32 = f32::MAX;

    // loop over each LAB in the user's palette, and find the closest color
    for color in palette {
        let delta = DeltaE::new(lab.clone(), color.clone(), convert_method);

        if delta.value() < &closest_distance {
            closest_color = color.clone();
            closest_distance = delta.value().clone()
        }
    }

    // convert the LAB back to RGBA
    closest_color.to_rgba()
}
