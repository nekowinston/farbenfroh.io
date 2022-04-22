pub mod custom_lab;

use crate::custom_lab::Lab;
use deltae::{DEMethod, DeltaE};
use image::{EncodableLayout, ImageBuffer, Pixel, RgbaImage};
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
    let img_pixels = img.pixels();
    let mut img_labs: Vec<Lab> = vec![];

    for pixel in img_pixels {
        let rgb = [
            pixel.channels()[0],
            pixel.channels()[1],
            pixel.channels()[2],
        ];
        img_labs.push(Lab {
            l: Lab::from_rgb(&rgb).l,
            a: Lab::from_rgb(&rgb).a,
            b: Lab::from_rgb(&rgb).b,
        });
    }

    // loop over each LAB in the LAB-converted image
    let x: Vec<u8> = img_labs
        .par_iter()
        .map(|lab| {
            // keep track of the closest color
            let mut closest_color: Lab = Default::default();
            // keep track of the closest distance measured, initially set as high as possible
            let mut closest_distance: f32 = f32::MAX;

            // loop over each LAB in the user's palette, and find the closest color
            for color in labs {
                let delta = DeltaE::new(lab.clone(), color.clone(), convert_method);

                if delta.value() < &closest_distance {
                    closest_color = color.clone();
                    closest_distance = delta.value().clone()
                }
            }

            // convert the LAB back to RGB
            let lab = Lab {
                a: closest_color.a,
                b: closest_color.b,
                l: closest_color.l,
            };
            let rgb = lab.to_rgb();

            return [rgb[0], rgb[1], rgb[2], 255];
        })
        .flatten()
        .collect();

    return x;
}
