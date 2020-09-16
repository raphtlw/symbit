use std::env;
use std::fs;
use std::io;
use std::io::Write;
use std::path::{Path, PathBuf};

pub fn temp_dir() -> PathBuf {
    // for debugging
    println!("{}", env::temp_dir().to_str().unwrap());
    env::temp_dir().join("symbit")
}
pub const PLATFORM_TOOLS_DIR: &str = "platform-tools";

#[non_exhaustive]
#[allow(dead_code)]
pub struct SupportedDevices;

impl SupportedDevices {
    pub const GOOGLE_PIXEL: &'static str = "Google Pixel";
    pub const ONEPLUS: &'static str = "OnePlus";
}

pub trait Indoc {
    fn trim_margin(&self) -> String;
}

impl<S: AsRef<str>> Indoc for S {
    fn trim_margin(&self) -> String {
        let lines: Vec<&str> = self
            .as_ref()
            .split("\n")
            .map(|line| line.trim_start())
            .filter(|&n| n != "")
            .collect();
        lines.join(" ")
    }
}

// pub enum PlatformToolsVariant {
//     Linux,
//     Mac,
//     Windows,
// }

// impl PlatformToolsVariant {
//     pub fn from_str(s: &str) -> Option<PlatformToolsVariant> {
//         match s {
//             "linux" => Some(PlatformToolsVariant::Linux),
//             "darwin" => Some(PlatformToolsVariant::Mac),
//             "windows" => Some(PlatformToolsVariant::Windows),
//             _ => None,
//         }
//     }
//     pub fn as_str(&self) -> &str {
//         match self {
//             PlatformToolsVariant::Linux => "linux",
//             PlatformToolsVariant::Mac => "darwin",
//             PlatformToolsVariant::Windows => "windows",
//         }
//     }
// }

pub async fn download_platform_tools(platform: &str) {
    // Fetch platform tools in bytes and write to file
    let url: String = format!(
        "https://dl.google.com/android/repository/platform-tools-latest-{}.zip",
        platform
    );
    let resp = reqwest::blocking::get(&url).unwrap().bytes().unwrap();
    let mut out = fs::File::create(temp_dir().join(format!("{}.zip", PLATFORM_TOOLS_DIR)))
        .expect("Failed to create platform tools file");
    out.write_all(&resp).unwrap();

    // Extract platform tools zip
    let downloaded_zip =
        fs::File::open(temp_dir().join(format!("{}.zip", PLATFORM_TOOLS_DIR))).unwrap();
    extract_zip(downloaded_zip, &temp_dir());
}

pub fn extract_zip(source: fs::File, target: &Path) {
    let file = source;
    let mut archive = zip::ZipArchive::new(file).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        println!("File name: {}", file.name());
        #[allow(deprecated)]
        let outpath = target.join(file.sanitized_name());
        println!("File sanitized name: {}", outpath.to_str().unwrap());

        if (&*file.name()).ends_with('/') {
            fs::create_dir_all(&outpath).unwrap();
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(&p).unwrap();
                }
            }
            let mut outfile = fs::File::create(&outpath).unwrap();
            io::copy(&mut file, &mut outfile).unwrap();
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
    }
}
