use deltae::{Delta, DeltaEq, LabValue};
use lab::Lab;

#[derive(Copy, Clone, Default)]
pub struct CustomLab {
    pub l: f32,
    pub a: f32,
    pub b: f32,
}

impl CustomLab {
    pub(crate) fn from_rgb(rgb: &[u8; 3]) -> Self {
        let lab_values = Lab::from_rgb(rgb);
        return CustomLab {
            l: lab_values.l,
            a: lab_values.a,
            b: lab_values.b,
        };
    }
}

impl From<CustomLab> for LabValue {
    fn from(lab: CustomLab) -> LabValue {
        LabValue {
            l: lab.l,
            a: lab.a,
            b: lab.b,
        }
    }
}

impl<D: Delta + Copy> DeltaEq<D> for CustomLab {}
