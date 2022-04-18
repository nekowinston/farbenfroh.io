use deltae::*;
use image::{ImageBuffer, Pixel, RgbaImage};
use lab::Lab;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

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
) -> Vec<u8> {
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

    let mut img_new = img.clone();

    let iter_colors = labs.clone();

    for (i, lab) in img_labs.enumerate() {
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

        // write the new pixel to the image
        let new_pixel = image::Rgba([rgb[0] as u8, rgb[1] as u8, rgb[2] as u8, 255]);
        let row = i as u32 / img.dimensions().0;
        let col = i as u32 % img.dimensions().0;
        img_new.put_pixel(col, row, new_pixel);
    }
    let mut buf: Vec<u8> = vec![];
    img_new
        .write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::Png)
        .unwrap();
    return buf;
}
