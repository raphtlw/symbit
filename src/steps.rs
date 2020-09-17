use crate::{root::RootSteps, update::UpdateSteps};
use iced::Element;

#[derive(Clone)]
pub enum Steps {
    RootSteps(RootSteps),
    UpdateSteps(UpdateSteps),
}

impl Steps {
    pub fn update(&mut self, msg: StepMessage) {
        match self {
            Self::RootSteps(this) => this.steps[this.current].update(msg),
            Self::UpdateSteps(this) => this.steps[this.current].update(msg),
        };
    }

    pub fn view(&mut self) -> Element<StepMessage> {
        match self {
            Self::RootSteps(this) => this.steps[this.current].view(),
            Self::UpdateSteps(this) => this.steps[this.current].view(),
        }
    }

    pub fn advance(&mut self) {
        println!("advance fn called");
        match self {
            Self::RootSteps(this) => {
                if this.can_continue() {
                    println!("can continue");
                    this.current += 1;
                } else {
                    println!("cannot continue");
                }
            }
            Self::UpdateSteps(this) => {
                if this.can_continue() {
                    this.current += 1;
                }
            }
        }
    }

    pub fn go_back(&mut self) {
        println!("go_back fn called");
        match self {
            Self::RootSteps(this) => {
                if this.has_previous() {
                    println!("has previous");
                    this.current -= 1;
                } else {
                    println!("does not have previous");
                }
            }
            Self::UpdateSteps(this) => {
                if this.has_previous() {
                    this.current -= 1;
                }
            }
        }
    }

    pub fn has_previous(&self) -> bool {
        match self {
            Self::RootSteps(this) => this.current > 0,
            Self::UpdateSteps(this) => this.current > 0,
        }
    }

    pub fn can_continue(&self) -> bool {
        match self {
            Self::RootSteps(this) => {
                this.current + 1 < this.steps.len() && this.steps[this.current].can_continue()
            }
            Self::UpdateSteps(this) => {
                this.current + 1 < this.steps.len() && this.steps[this.current].can_continue()
            }
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum StepMessage {}
