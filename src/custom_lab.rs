use deltae::{Delta, DeltaEq, LabValue};
use lab::Lab as LabBase;

#[derive(Copy, Clone, Default)]
pub struct Lab {
    pub l: f32,
    pub a: f32,
    pub b: f32,
}

impl Lab {
    pub fn new(l: f32, a: f32, b: f32) -> Lab {
        Lab { l, a, b }
    }

    pub(crate) fn from_rgb(rgb: &[u8; 3]) -> Self {
        Lab::from(LabBase::from_rgb(rgb))
    }

    pub(crate) fn from_rgba(rgba: &[u8; 4]) -> Self {
        Lab::from(LabBase::from_rgba(rgba))
    }

    pub(crate) fn from(lab: lab::Lab) -> Self {
        Lab::new(lab.l, lab.a, lab.b)
    }

    pub(crate) fn to_rgb(self: Self) -> [u8; 3] {
        LabBase::from(self).to_rgb()
    }

    pub(crate) fn to_rgba(self: Self) -> [u8; 4] {
        let rgb = LabBase::from(self).to_rgb();
        [rgb[0], rgb[1], rgb[2], 255]
    }
}

impl From<Lab> for LabValue {
    fn from(lab: Lab) -> Self {
        LabValue {
            l: lab.l,
            a: lab.a,
            b: lab.b,
        }
    }
}

impl From<Lab> for lab::Lab {
    fn from(lab: Lab) -> Self {
        lab::Lab {
            l: lab.l,
            a: lab.a,
            b: lab.b,
        }
    }
}

impl<D: Delta + Copy> DeltaEq<D> for Lab {}
