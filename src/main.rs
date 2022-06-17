#[allow(unused_imports)]
use iced::{
    alignment, button, scrollable, slider, text_input, Alignment, Button, Checkbox, Color,
    Column, Container, ContentFit, Element, Length, Radio, Row, Sandbox,
    Scrollable, Settings, Slider, Space, Text, TextInput, Toggler,
};

use native_dialog::FileDialog;
use faerber::palettize;

pub fn main() -> iced::Result {
    Hello::run(Settings::default())
}

#[derive(Default)]
struct Hello {
    upload: button::State,
}

#[derive(Debug, Clone, Copy)]
enum Message {
        ButtonPressed,
}



impl Sandbox for Hello {
    type Message = Message;
    
    fn new() -> Self {
        Self::default()
    }

    fn title(&self) -> String {
        String::from("Farbenfroh")
    }
    
    fn update(&mut self, message: Self::Message) {
        match message {
            Message::ButtonPressed => {
                println!("Button pressed");
                let path = FileDialog::new()
                    .set_location("~")
                    .add_filter("PNG Image", &["png"])
                    .add_filter("JPEG Image", &["jpg", "jpeg"])
                    .show_open_single_file()
                    .unwrap();
                let path = match path {
                    Some(path) => {
                        println!("File selected: {:?}", path);
                        palettize(path.to_str(), "latte", "result.png")
                    },
                    None => return,
                };
            }
        }
    }

        fn view(&mut self) -> Element<Self::Message> {
            let content = Column::new()
                .padding(20)
                .align_items(Alignment::Center)
                .push(
                    Text::new("faerber!")
                    .size(100)
            )
            .push(  
                Button::new(&mut self.upload, Text::new("Upload"))
                    .on_press(Message::ButtonPressed),
            );
        Container::new(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x()
            .center_y()
            .into()
    }
}