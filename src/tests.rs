use super::*;
use util::*;

#[test]
fn test_trim_margin() {
    let string = "
    test
    test
    ";
    assert_eq!(string.trim_margin(), "test test")
}
