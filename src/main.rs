use iced::{
    alignment, button, scrollable, slider, text_input, Button, Checkbox, Color,
    Column, Container, ContentFit, Element, Length, Radio, Row, Sandbox,
    Scrollable, Settings, Slider, Space, Text, TextInput, Toggler,
};


pub fn main() -> iced::Result {
    Hello::run(Settings::default())
}
struct Hello;

impl Sandbox for Hello {
    type Message = ();
    
    fn new() -> Hello {
        Hello
    }

    fn title(&self) -> String {
        String::from("Farbenfroh")
    }
    
    fn update(&mut self, message: Self::Message) {
    }

    fn view(&mut self) -> Element<Self::Message> {
        Text::new("Hello, world!").into()
    }
}