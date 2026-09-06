use crate::engine::decoder::HardwareDecoder;
use std::sync::Mutex;

pub struct VideoEngineState {
    pub is_playing: Mutex<bool>,
    // Option isliye use kiya hai taaki future mein jab user file load kare tabhi engine fully start ho
    pub decoder: Mutex<Option<HardwareDecoder>>,
}

impl VideoEngineState {
    pub fn new() -> Self {
        // App start hote hi ek decoder instance banate hain
        let initial_decoder = HardwareDecoder::new().ok();

        Self {
            is_playing: Mutex::new(false),
            decoder: Mutex::new(initial_decoder),
        }
    }
}
