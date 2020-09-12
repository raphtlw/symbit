use iced::{button, Background, Color, Vector};

pub enum Button {
    Primary,
    Secondary,
}

impl button::StyleSheet for Button {
    fn active(&self) -> button::Style {
        button::Style {
            background: Some(Background::Color(match self {
                Button::Primary => Color::from_rgb(1.0, 0.5294117647, 0.48235294117),
                Button::Secondary => Color::from_rgb(0.42352941176, 0.77647058823, 1.0),
            })),
            border_radius: 4,
            shadow_offset: Vector::new(1.0, 1.0),
            ..button::Style::default()
        }
    }
    fn hovered(&self) -> button::Style {
        button::Style {
            text_color: Color::BLACK,
            shadow_offset: Vector::new(1.0, 2.0),
            ..self.active()
        }
    }
}
