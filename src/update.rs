use iced::{button, Column, Element};

#[derive(Clone)]
pub struct UpdateSteps {
    steps: Vec<UpdateStep>,
    current: usize,
}

impl UpdateSteps {
    pub fn new() -> UpdateSteps {
        UpdateSteps {
            steps: vec![
                UpdateStep::Intro,
                UpdateStep::PromptPlugInPhone,
                UpdateStep::StartADBServer,
                UpdateStep::GetLatestFactoryImage,
                UpdateStep::PatchBootImage,
                UpdateStep::Flash,
                UpdateStep::End,
            ],
            current: 0,
        }
    }

    pub fn update(&mut self, msg: UpdateStepMessage) {
        self.steps[self.current].update(msg);
    }

    pub fn view(&mut self) -> Element<UpdateStepMessage> {
        self.steps[self.current].view()
    }

    pub fn advance(&mut self) {
        if self.can_continue() {
            self.current += 1;
        }
    }

    pub fn go_back(&mut self) {
        if self.has_previous() {
            self.current -= 1;
        }
    }

    pub fn has_previous(&self) -> bool {
        self.current > 0
    }

    pub fn can_continue(&self) -> bool {
        self.current + 1 < self.steps.len() && self.steps[self.current].can_continue()
    }

    pub fn title(&self) -> &str {
        self.steps[self.current].title()
    }
}

#[derive(Clone, Copy)]
pub enum UpdateStep {
    Intro,
    PromptPlugInPhone,
    StartADBServer,
    UnlockBootloader,
    GetLatestFactoryImage,
    PatchBootImage,
    Flash,
    End,
}

#[derive(Debug, Clone, Copy)]
pub enum UpdateStepMessage {}

impl<'a> UpdateStep {
    fn update(&mut self, msg: UpdateStepMessage) {
        match msg {}
    }

    fn title(&self) -> &str {
        match self {
            Self::Intro => "Introduction",
            Self::PromptPlugInPhone => "Plug in your phone",
            Self::StartADBServer => "Start ADB server",
            Self::UnlockBootloader => "Unlock bootloader",
            Self::GetLatestFactoryImage => "Download image",
            Self::PatchBootImage => "Patch image",
            Self::Flash => "Flash to device",
            Self::End => "Finish",
        }
    }

    fn can_continue(&self) -> bool {
        match self {
            Self::Intro => true,
            Self::PromptPlugInPhone => true,
            Self::StartADBServer => true,
            Self::UnlockBootloader => true,
            Self::GetLatestFactoryImage => true,
            Self::PatchBootImage => true,
            Self::Flash => true,
            Self::End => true,
        }
    }

    fn view(&mut self) -> Element<UpdateStepMessage> {
        match self {
            Self::Intro => Self::intro(),
            Self::PromptPlugInPhone => Self::prompt_plug_in_phone(),
            Self::StartADBServer => Self::start_adb_server(),
            Self::UnlockBootloader => Self::unlock_bootloader(),
            Self::GetLatestFactoryImage => Self::get_latest_factory_image(),
            Self::PatchBootImage => Self::patch_boot_image(),
            Self::Flash => Self::flash(),
            Self::End => Self::end(),
        }
        .into()
    }

    fn intro() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn download_and_install_magisk() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn prompt_plug_in_phone() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn start_adb_server() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn unlock_bootloader() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn get_latest_factory_image() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn patch_boot_image() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn flash() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }

    fn end() -> Column<'a, UpdateStepMessage> {
        Column::new()
    }
}
