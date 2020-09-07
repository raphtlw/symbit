use clap::{App, Arg};
use colored::*;
use indoc::indoc;

const ABOUT: &str = indoc! {"
    SYMBIT
    ---
    A root manager for Android devices which allows you to update
    existing rooted devices, tweak magisk and run other commands which improve the
    Android root experience and adds onto Magisk. 🚀

    - raphtlw
"};

fn main() {
    println!();
    println!("{}", ABOUT.white().bold());

    let opts = App::new("Symbit")
        .version("0.0.2")
        .author("Raphael T. <raphpb1912@gmail.com>")
        .about(ABOUT)
        .arg(
            Arg::new("verbose")
                .short('v')
                .long("verbose")
                .about("Verbose mode"),
        )
        .subcommand(App::new("update").about("Update your phone to the latest version of Android"))
        .get_matches();

    match opts.subcommand_name() {
        Some("update") => println!("Updating..."),
        _ => panic!("No command specified"),
    }
}
