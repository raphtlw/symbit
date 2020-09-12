// use crate::style;
// use iced::{button, Align, Button, Column, Container, Element, Length, Row, Space, Text};
// use indoc::indoc;

// pub struct Views {
//     current: View,
// }

// impl Views {
//     pub fn new() -> Views {
//         Views {
//             current: View::Home {
//                 root_button: button::State::new(),
//                 update_button: button::State::new(),
//             },
//         }
//     }

//     pub fn update(&mut self, msg: ViewMessage) {
//         self.current.update(msg);
//     }

//     pub fn view(&mut self) -> Element<ViewMessage> {
//         self.current.view()
//     }

//     pub fn title(&self) -> &str {
//         self.current.title()
//     }

//     pub fn set(&mut self, view: View) {
//         self.current = view;
//     }
// }

// pub enum View {
//     Home {
//         root_button: button::State,
//         update_button: button::State,
//     },
//     Root,
//     Update,
// }

// #[derive(Debug, Clone)]
// pub enum ViewMessage {}

// impl<'a> View {
//     fn update(&mut self, msg: ViewMessage) {
//         match msg {}
//     }

//     fn title(&self) -> &str {
//         match self {
//             View::Home { .. } => "Start",
//             View::Root => "Root",
//             View::Update => "Update",
//         }
//     }

//     fn view(&mut self) -> Element<ViewMessage> {
//         match self {
//             View::Home {
//                 root_button,
//                 update_button,
//             } => Self::home(root_button, update_button),
//             View::Root => Self::root(),
//             View::Update => Self::update_view(),
//         }
//         .into()
//     }

//     fn home(
//         root_button: &'a mut button::State,
//         update_button: &'a mut button::State,
//     ) -> Column<'a, ViewMessage> {
//         Column::new()
//             .padding(20)
//             .push(Text::new("Symbit").size(30))
//             .push(Space::new(Length::Fill, Length::from(10)))
//             .push(
//                 Text::new(
//                     indoc! {"
//                         A root manager for Android devices which allows you to update
//                         existing rooted devices, tweak magisk and run other commands
//                         which improve the Android root experience and adds onto Magisk.
//                     "}
//                     .replace("\n", " "),
//                 )
//                 .size(15),
//             )
//             .push(Space::new(Length::Fill, Length::from(20)))
//             .push(
//                 Row::new()
//                     .push(
//                         Text::new(
//                             indoc! {"
//                                 Root your device with Magisk via boot image patching.
//                             "}
//                             .replace("\n", " "),
//                         )
//                         .size(15),
//                     )
//                     .push(Space::new(Length::from(10), Length::Shrink))
//                     .push(
//                         Button::new(
//                             root_button,
//                             Container::new(Text::new("start").size(15)).padding(4),
//                         )
//                         .on_press()
//                         .style(style::Button::Primary),
//                     )
//                     .align_items(Align::Center),
//             )
//             .push(
//                 Row::new()
//                     .push(
//                         Text::new(
//                             indoc! {"
//                                 Update your existing rooted Android device.
//                             "}
//                             .replace("\n", " "),
//                         )
//                         .size(15),
//                     )
//                     .push(Space::new(Length::from(10), Length::Shrink))
//                     .push(
//                         Button::new(
//                             update_button,
//                             Container::new(Text::new("start").size(15)).padding(4),
//                         )
//                         .on_press()
//                         .style(style::Button::Primary),
//                     )
//                     .align_items(Align::Center),
//             )
//     }

//     fn root() -> Column<'a, ViewMessage> {
//         Column::new()
//     }

//     fn update_view() -> Column<'a, ViewMessage> {
//         Column::new()
//     }
// }
