use deltae::{Delta, DeltaEq, LabValue};
use lab::Lab as LabBase;

#[derive(Copy, Clone, Default, Debug)]
pub struct Lab {
    pub l: f32,
    pub a: f32,
    pub b: f32,
    pub alpha: f32,
}

impl Lab {
    pub fn new(l: f32, a: f32, b: f32, alpha: f32) -> Lab {
        Lab {
            l,
            a,
            b,
            alpha: alpha.max(0.0).min(1.0),
        }
    }

    pub fn from_rgb(rgb: &[u8; 3]) -> Self {
        Lab::from(LabBase::from_rgb(rgb), 1.0)
    }

    pub fn from_rgba(rgba: &[u8; 4]) -> Self {
        Lab::from(LabBase::from_rgba(rgba), rgba[3] as f32 / 255.0)
    }

    pub fn from(lab: lab::Lab, alpha: f32) -> Self {
        Lab::new(lab.l, lab.a, lab.b, alpha)
    }

    pub fn to_rgb(self) -> [u8; 3] {
        LabBase::from(self).to_rgb()
    }

    pub fn to_rgba(self) -> [u8; 4] {
        let rgb = LabBase::from(self).to_rgb();
        [rgb[0], rgb[1], rgb[2], (self.alpha * 255.0) as u8]
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

impl From<Lab> for LabBase {
    fn from(lab: Lab) -> Self {
        LabBase {
            l: lab.l,
            a: lab.a,
            b: lab.b,
        }
    }
}

impl<D: Delta + Copy> DeltaEq<D> for Lab {}
