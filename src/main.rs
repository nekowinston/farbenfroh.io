#[allow(unused_imports)]
use iced::{
    alignment, button, scrollable, slider, text_input, Alignment, Button, Checkbox, Color,
    Column, Container, ContentFit, Command, Element, Image, Length, Radio, Row, Sandbox,
    Scrollable, Settings, Slider, Space, Text, TextInput, Toggler,
};

use native_dialog::FileDialog;
use faerber::palettize;

pub fn main() -> iced::Result {
    Faerber::run(Settings::default())
}

#[derive(Debug)]
enum Faerber {
    Fresh {
        upload: button::State,
    },
    Finished {
        upload: button::State,
    },
}


#[derive(Debug, Clone)]
enum Message {
        Completed(Result<(),Error>),
        ButtonPressed,
}



impl Sandbox for Faerber {
    type Message = Message;

    
    fn new() -> Self {
        Self::Fresh {
            upload: button::State::new(),
        }
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
                match path {
                    Some(path) => {
                        println!("File selected: {:?}", path);
                        //palettize(path.to_str(), "latte", "result.png");
                        Command::perform(magic(path.to_str()), Message::Completed);
                        *self = Self::Finished { upload: button::State::new() }
                    },
                    None => return,
                };
            }
        }
    }

        fn view(&mut self) -> Element<Self::Message> {
            let content = match self { 
                Self::Fresh {upload} => Column::new()
                    .padding(20)
                    .align_items(Alignment::Center)
                    .push(
                        Text::new("faerber!")
                        .size(100)
                    )
                    .push(  
                        Button::new(upload, Text::new("Upload"))
                            .on_press(Message::ButtonPressed),
                    ),
                Self::Finished {upload} => Column::new()
                        .padding(20)
                        .align_items(Alignment::Center)
                        .push(
                            Text::new("faerber!")
                            .size(100)
                        )
                        .push(  
                            Button::new(upload, Text::new("Upload"))
                                .on_press(Message::ButtonPressed),
                        )
                        .push(
                            Image::new("result.png")
                        ),
            };
        Container::new(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x()
            .center_y()
            .into()
    }
}

async fn magic(path: Option<&str>) {
    palettize(path, "latte", "result.png");
}

#[derive(Debug,Clone)]
enum Error {
    APIError,
    LanguageError,
}