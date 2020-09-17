mod error;
mod root;
mod steps;
mod style;
#[cfg(test)]
mod tests;
mod update;
mod util;
mod views;

use error::*;
use iced::{
    button, executor, scrollable, window, Align, Application, Button, Column, Command, Container,
    Element, HorizontalAlignment, Length, Row, Scrollable, Settings, Space, Text,
};
use std::env;
use std::fs;
use steps::{StepMessage, Steps};
use util::*;

fn main() {
    Main::run(Settings {
        antialiasing: true,
        window: window::Settings {
            size: (600, 400),
            ..window::Settings::default()
        },
        ..Settings::default()
    });
}

struct Main {
    view: View,
    root_steps: Steps,
    update_steps: Steps,
    scroll: scrollable::State,
}

#[derive(Debug, Clone)]
pub enum Message {
    RootButtonPressed,
    UpdateButtonPressed,
    BackButtonPressed,
    NextButtonPressed,
    InitComplete(Result<(), Error>),
    StepMessage(StepMessage),
}

impl Application for Main {
    type Executor = executor::Default;
    type Message = Message;
    type Flags = ();

    fn new(_flags: ()) -> (Main, Command<Self::Message>) {
        (
            Main {
                view: View::Home {
                    root_button: button::State::new(),
                    update_button: button::State::new(),
                },
                scroll: scrollable::State::new(),
                root_steps: Steps::RootSteps(root::RootSteps::new()),
                update_steps: Steps::UpdateSteps(update::UpdateSteps::new()),
            },
            Command::perform(View::init(), Message::InitComplete),
        )
    }

    fn title(&self) -> String {
        format!("{} - Symbit", self.view.title())
    }

    fn update(&mut self, message: Self::Message) -> Command<Self::Message> {
        match message {
            Message::RootButtonPressed => {
                self.view = View::Root {
                    steps: self.root_steps.clone(),
                    back_button: button::State::new(),
                    next_button: button::State::new(),
                }
            }
            Message::UpdateButtonPressed => {
                self.view = View::Update {
                    steps: self.update_steps.clone(),
                    back_button: button::State::new(),
                    next_button: button::State::new(),
                }
            }
            Message::InitComplete { .. } => (),
            Message::BackButtonPressed => {
                println!("Back button pressed");
                self.root_steps.go_back();
                self.update_steps.go_back();
            }
            Message::NextButtonPressed => {
                println!("Next button pressed");
                self.root_steps.advance();
                self.update_steps.advance();
            }
            Message::StepMessage(msg) => {
                self.root_steps.update(msg);
                self.update_steps.update(msg);
            }
        }

        Command::none()
    }

    fn view(&mut self) -> Element<Self::Message> {
        Container::new(Scrollable::new(&mut self.scroll).push(self.view.view())).into()
    }
}

enum View {
    Home {
        root_button: button::State,
        update_button: button::State,
    },
    Root {
        steps: Steps,
        back_button: button::State,
        next_button: button::State,
    },
    Update {
        steps: Steps,
        back_button: button::State,
        next_button: button::State,
    },
}

impl<'a> View {
    fn title(&self) -> &str {
        match self {
            View::Home { .. } => "Start",
            View::Root { .. } => "Root",
            View::Update { .. } => "Update",
        }
    }

    fn view(&mut self) -> Element<Message> {
        match self {
            View::Home {
                root_button,
                update_button,
            } => Self::home(root_button, update_button),
            View::Root {
                steps,
                back_button,
                next_button,
            } => Self::root_view(steps, back_button, next_button),
            View::Update {
                steps,
                back_button,
                next_button,
            } => Self::update_view(steps, back_button, next_button),
        }
        .into()
    }

    async fn init() -> Result<(), Error> {
        if !temp_dir().exists() {
            fs::create_dir(temp_dir()).unwrap();
        }

        if !temp_dir().join(PLATFORM_TOOLS_DIR).exists() {
            match env::consts::OS {
                "linux" => download_platform_tools("linux").await,
                "windows" => download_platform_tools("windows").await,
                "macos" => download_platform_tools("darwin").await,
                _ => panic!("Platform not supported"),
            }
        }

        Ok(())
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
                    "
                    A root manager for Android devices which allows you to update
                    existing rooted devices, tweak magisk and run other commands
                    which improve the Android root experience and adds onto Magisk.
                    "
                    .trim_margin(),
                )
                .size(15),
            )
            .push(Space::new(Length::Fill, Length::from(20)))
            .push(
                Row::new()
                    .push(
                        Text::new("Root your device with Magisk via boot image patching.").size(15),
                    )
                    .push(Space::new(Length::from(10), Length::Shrink))
                    .push(
                        Button::new(
                            root_button,
                            Container::new(Text::new("start").size(15)).padding(4),
                        )
                        .on_press(Message::RootButtonPressed)
                        .style(style::Button::Primary)
                        .min_width(50),
                    )
                    .align_items(Align::Center),
            )
            .push(
                Row::new()
                    .push(Text::new("Update your existing rooted Android device.").size(15))
                    .push(Space::new(Length::from(10), Length::Shrink))
                    .push(
                        Button::new(
                            update_button,
                            Container::new(Text::new("start").size(15)).padding(4),
                        )
                        .on_press(Message::UpdateButtonPressed)
                        .style(style::Button::Primary)
                        .min_width(50),
                    )
                    .align_items(Align::Center),
            )
    }

    fn container(
        header: &str,
        steps: &'a mut Steps,
        back_button_state: &'a mut button::State,
        next_button_state: &'a mut button::State,
    ) -> Column<'a, Message> {
        let back_button = Button::new(
            back_button_state,
            Text::new("Back")
                .horizontal_alignment(HorizontalAlignment::Center)
                .size(15),
        )
        .padding(6)
        .min_width(50)
        .style(style::Button::Secondary)
        .on_press(Message::BackButtonPressed);

        let next_button = Button::new(
            next_button_state,
            Text::new("Next")
                .horizontal_alignment(HorizontalAlignment::Center)
                .size(15),
        )
        .padding(6)
        .min_width(50)
        .style(style::Button::Primary)
        .on_press(Message::NextButtonPressed);

        let mut controls = Row::new();

        if steps.has_previous() {
            controls = controls.push(back_button);
        }

        controls = controls.push(Space::with_width(Length::Fill));

        if steps.can_continue() {
            controls = controls.push(next_button);
        }

        Column::new()
            .padding(20)
            .push(Text::new(header).size(20))
            .push(Space::new(Length::Fill, Length::from(10)))
            .push(steps.view().map(Message::StepMessage))
            .push(controls)
    }

    fn root_view(
        steps: &'a mut Steps,
        back_button_state: &'a mut button::State,
        next_button_state: &'a mut button::State,
    ) -> Column<'a, Message> {
        Self::container("Root", steps, back_button_state, next_button_state)
    }

    fn update_view(
        steps: &'a mut Steps,
        back_button_state: &'a mut button::State,
        next_button_state: &'a mut button::State,
    ) -> Column<'a, Message> {
        Self::container("Update", steps, back_button_state, next_button_state)
    }
}
