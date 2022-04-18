use deltae::*;
use image::{EncodableLayout, ImageBuffer, Pixel, RgbaImage};
use lab::Lab;
use wasm_bindgen::prelude::*;
use wasm_bindgen::{Clamped, JsCast};
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(msg: &str);
}

#[derive(Copy, Clone)]
struct MyLab {
    l: f32,
    a: f32,
    b: f32,
}
impl MyLab {}

impl From<MyLab> for LabValue {
    fn from(my_lab: MyLab) -> Self {
        LabValue {
            l: my_lab.l,
            a: my_lab.a,
            b: my_lab.b,
        }
    }
}

impl<D: Delta + Copy> DeltaEq<D> for MyLab {}

#[wasm_bindgen]
pub fn process(
    buffer: Vec<u8>,
    width: u32,
    height: u32,
    method: String,
    palette: &[u8],
    target_canvas: String,
) {
    let img: RgbaImage = ImageBuffer::from_vec(width, height, buffer).unwrap();

    let convert_method: DEMethod;
    if method == "76" {
        convert_method = deltae::DE1976
    } else if method == "94t" || method == "94" {
        convert_method = deltae::DE1994T
    } else if method == "94g" {
        convert_method = deltae::DE1994G
    } else if method == "2000" {
        convert_method = deltae::DE2000
    } else {
        convert_method = deltae::DE1976
    }

    let mut labs = vec![];
    for (i, _e) in palette.iter().enumerate().step_by(3) {
        let val1 = palette[i + 0];
        let val2 = palette[i + 1];
        let val3 = palette[i + 2];
        labs.push(Lab::from_rgb(&[val1, val2, val3]));
    }

    // map the colors of the image to the LAB space
    let img_pixels = img.pixels();
    let img_labs = img_pixels.map(|pixel| {
        let rgb = [
            pixel.channels()[0],
            pixel.channels()[1],
            pixel.channels()[2],
        ];
        return Lab::from_rgb(&rgb);
    });

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

    let iter_colors = labs.clone();
    let mut buffer_data = vec![];

    for lab in img_labs {
        let labv = LabValue {
            a: lab.a,
            b: lab.b,
            l: lab.l,
        };

        // keep track of the closest color
        let mut closest_color: LabValue = LabValue {
            a: 0.0,
            b: 0.0,
            l: 0.0,
        };
        let mut closest_distance: f32 = 1000.0;
        for color in &iter_colors {
            let colorv = LabValue {
                a: color.a,
                b: color.b,
                l: color.l,
            };
            let delta = DeltaE::new(&labv, &colorv, convert_method);
            let deltav = delta.value();

            if deltav < &closest_distance {
                closest_color = colorv.clone();
                closest_distance = deltav.clone();
            }
        }

        // convert the LAB back to RGB
        let lab = Lab {
            a: closest_color.a,
            b: closest_color.b,
            l: closest_color.l,
        };
        let rgb = lab.to_rgb();
        // push flattened rgb to buffer
        buffer_data.push(rgb[0]);
        buffer_data.push(rgb[1]);
        buffer_data.push(rgb[2]);
        buffer_data.push(255);
    }

    let data = buffer_data.as_bytes();
    let data = ImageData::new_with_u8_clamped_array_and_sh(Clamped(data), width, height).unwrap();
    context.put_image_data(&data, 0 as f64, 0 as f64).unwrap();
}
