use std::env;
use std::fs::File;
use std::io::Write;
use std::path::Path;

pub const DIR: &Path = env::temp_dir().as_path();
pub const http_client: reqwest::Client = reqwest::Client::new();

pub enum PlatformToolsVariant {
    Linux,
    Mac,
    Windows,
}

impl PlatformToolsVariant {
    // pub fn from_str(s: &str) -> Option<PlatformToolsVariant> {
    //     match s {
    //         "linux" => Some(PlatformToolsVariant::Linux),
    //         "darwin" => Some(PlatformToolsVariant::Mac),
    //         "windows" => Some(PlatformToolsVariant::Windows),
    //         _ => None,
    //     }
    // }
    pub fn as_str(&self) -> &'static str {
        match self {
            PlatformToolsVariant::Linux => "linux",
            PlatformToolsVariant::Mac => "darwin",
            PlatformToolsVariant::Windows => "windows",
        }
    }
}

pub async fn download_platform_tools(platform: PlatformToolsVariant) {
    // Fetch platform tools in bytes and write to file
    let mut resp = http_client
        .get(format!(
            "https://dl.google.com/android/repository/platform-tools-latest-{}.zip",
            platform.as_str()
        ))
        .send()
        .await
        .unwrap()
        .bytes()
        .await
        .unwrap();
    let mut out =
        File::create(DIR.join("platform-tools.zip")).expect("Failed to create platform tools file");
    out.write_all(&resp);

    // Extract platform tools zip
}
