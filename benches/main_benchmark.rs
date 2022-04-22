use criterion::{criterion_group, criterion_main, Criterion};

use deltae::DEMethod;
use faerber::custom_lab::Lab;
use faerber::{convert, rgba_pixels_to_labs};
use image::RgbaImage;

fn convert_image_e76(img: RgbaImage, palette: Vec<Lab>) -> Vec<u8> {
    return convert(img, DEMethod::DE1976, &palette);
}

fn convert_image_e94t(img: RgbaImage, palette: Vec<Lab>) -> Vec<u8> {
    return convert(img, DEMethod::DE1994T, &palette);
}

fn convert_image_e94g(img: RgbaImage, palette: Vec<Lab>) -> Vec<u8> {
    return convert(img, DEMethod::DE1994G, &palette);
}

fn convert_image_e2000(img: RgbaImage, palette: Vec<Lab>) -> Vec<u8> {
    return convert(img, DEMethod::DE2000, &palette);
}

pub fn benchmark(c: &mut Criterion) {
    c.sample_size(10);

    // benchmark image: Wanderer über dem Nebelmeer - by Casper David Friedrich
    let img: RgbaImage = image::open("./benches/wanderer-ueber-dem-nebelmeer.jpg")
        .expect("Benchmark image should exist")
        .to_rgba8();

    let img_pixels = img.pixels();

    // benchmark colorscheme: Nord - by Arctic Ice Studio
    let colors: &[u32] = &[
        0xB58DAE, 0xA2BF8A, 0xECCC87, 0xD2876D, 0xC16069, 0x5D80AE, 0x80A0C2, 0x86C0D1, 0x8EBCBB,
        0xECEFF4, 0xE5E9F0, 0xD8DEE9, 0x4C566B, 0x434C5F, 0x3B4253, 0x2E3440,
    ];

    let palette = faerber::convert_palette_to_lab(colors);

    // deltaE benchmarks
    c.bench_function("deltaE76", |b| {
        b.iter(|| convert_image_e76(img.clone(), palette.clone()))
    });
    c.bench_function("deltaE94G", |b| {
        b.iter(|| convert_image_e94g(img.clone(), palette.clone()))
    });
    c.bench_function("deltaE94T", |b| {
        b.iter(|| convert_image_e94t(img.clone(), palette.clone()))
    });
    c.bench_function("deltaE2000", |b| {
        b.iter(|| convert_image_e2000(img.clone(), palette.clone()))
    });

    // all the other operations
    c.bench_function("rgba_pixel_to_lab", |b| {
        b.iter(|| rgba_pixels_to_labs(img_pixels.clone()))
    });
}

criterion_group!(benches, benchmark);
criterion_main!(benches);
