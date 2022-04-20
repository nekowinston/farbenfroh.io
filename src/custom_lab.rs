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
        let lab_values = LabBase::from_rgb(rgb);
        return Lab {
            l: lab_values.l,
            a: lab_values.a,
            b: lab_values.b,
        };
    }
    pub(crate) fn to_rgb(self: Self) -> [u8; 3] {
        return LabBase::from(self).to_rgb();
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
