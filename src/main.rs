use iced::{
    alignment, button, scrollable, slider, text_input, Alignment, Button, Checkbox, Color,
    Column, Container, ContentFit, Element, Length, Radio, Row, Sandbox,
    Scrollable, Settings, Slider, Space, Text, TextInput, Toggler,
};


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
        
    }

    fn view(&mut self) -> Element<Self::Message> {
        Column::new()
            .padding(20)
            .align_items(Alignment::Center)
            .push(
                Text::new("faerber!")
                    .size(100)
            )
            .push(  
                Button::new(&mut self.upload, Text::new("Upload"))
                    .on_press(Message::ButtonPressed),
            )
            .into()
    }
}