mod style;
mod views;
use iced::{
    button, scrollable, window, Align, Button, Color, Column, Container, Element, Length, Row,
    Sandbox, Scrollable, Settings, Space, Text,
};
use indoc::indoc;

fn main() {
    Main::run(Settings {
        antialiasing: true,
        window: window::Settings {
            size: (600, 400),
            ..window::Settings::default()
        },
        ..Settings::default()
    })
}

struct Main {
    view: View,
    scroll: scrollable::State,
    debug: bool,
}

#[derive(Debug, Clone, Copy)]
pub enum Message {
    RootButtonPressed,
    UpdateButtonPressed,
}

impl Sandbox for Main {
    type Message = Message;
    fn new() -> Main {
        Main {
            view: View::Home {
                root_button: button::State::new(),
                update_button: button::State::new(),
            },
            scroll: scrollable::State::new(),
            debug: false,
        }
    }

    fn title(&self) -> String {
        format!("{} - Symbit", self.view.title())
    }

    fn update(&mut self, message: Self::Message) {
        match message {
            Message::RootButtonPressed => self.view = View::Root,
            Message::UpdateButtonPressed => self.view = View::Update,
        }
    }

    fn view(&mut self) -> Element<Self::Message> {
        let content: Element<_> = Column::new().push(self.view.view()).into();

        let content = if self.debug {
            content.explain(Color::BLACK)
        } else {
            content
        };

        Container::new(Scrollable::new(&mut self.scroll).push(content)).into()
    }
}

enum View {
    Home {
        root_button: button::State,
        update_button: button::State,
    },
    Root,
    Update,
}

impl<'a> View {
    fn title(&self) -> &str {
        match self {
            View::Home { .. } => "Start",
            View::Root => "Root",
            View::Update => "Update",
        }
    }

    fn view(&mut self) -> Element<Message> {
        match self {
            View::Home {
                root_button,
                update_button,
            } => Self::home(root_button, update_button),
            View::Root => Self::root(),
            View::Update => Self::update_view(),
        }
        .into()
    }

    fn home(
        root_button: &'a mut button::State,
        update_button: &'a mut button::State,
    ) -> Column<'a, Message> {
        Column::new()
            .padding(20)
            .push(Text::new("Symbit").size(30))
            .push(Space::new(Length::Fill, Length::from(10)))
            .push(
                Text::new(
                    indoc! {"
                        A root manager for Android devices which allows you to update
                        existing rooted devices, tweak magisk and run other commands
                        which improve the Android root experience and adds onto Magisk.
                    "}
                    .replace("\n", " "),
                )
                .size(15),
            )
            .push(Space::new(Length::Fill, Length::from(20)))
            .push(
                Row::new()
                    .push(
                        Text::new(
                            indoc! {"
                                Root your device with Magisk via boot image patching.
                            "}
                            .replace("\n", " "),
                        )
                        .size(15),
                    )
                    .push(Space::new(Length::from(10), Length::Shrink))
                    .push(
                        Button::new(
                            root_button,
                            Container::new(Text::new("start").size(15)).padding(4),
                        )
                        .on_press(Message::RootButtonPressed)
                        .style(style::Button::Primary),
                    )
                    .align_items(Align::Center),
            )
            .push(
                Row::new()
                    .push(
                        Text::new(
                            indoc! {"
                                Update your existing rooted Android device.
                            "}
                            .replace("\n", " "),
                        )
                        .size(15),
                    )
                    .push(Space::new(Length::from(10), Length::Shrink))
                    .push(
                        Button::new(
                            update_button,
                            Container::new(Text::new("start").size(15)).padding(4),
                        )
                        .on_press(Message::UpdateButtonPressed)
                        .style(style::Button::Primary),
                    )
                    .align_items(Align::Center),
            )
    }

    fn root() -> Column<'a, Message> {
        Column::new()
            .padding(20)
            .push(Text::new("Root").size(20))
            .push(Space::new(Length::Fill, Length::from(10)))
            .push(Text::new(
                indoc! {"
                    To root, you'll need to first have the
                    Magisk Manager installed on your device.
                "}
                .replace("\n", " "),
            ))
    }

    fn update_view() -> Column<'a, Message> {
        Column::new()
    }
}
