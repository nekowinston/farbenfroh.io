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
    let colors: &[u8] = &[
        0xB5, 0x8D, 0xAE, 0xA2, 0xBF, 0x8A, 0xEC, 0xCC, 0x87, 0xD2, 0x87, 0x6D, 0xC1, 0x60, 0x69,
        0x5D, 0x80, 0xAE, 0x80, 0xA0, 0xC2, 0x86, 0xC0, 0xD1, 0x8E, 0xBC, 0xBB, 0xEC, 0xEF, 0xF4,
        0xE5, 0xE9, 0xF0, 0xD8, 0xDE, 0xE9, 0x4C, 0x56, 0x6B, 0x43, 0x4C, 0x5F, 0x3B, 0x42, 0x53,
        0x2E, 0x34, 0x40,
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
