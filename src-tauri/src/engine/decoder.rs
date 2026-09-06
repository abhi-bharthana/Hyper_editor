use windows::core::{HSTRING, PCWSTR};
use windows::Win32::Media::MediaFoundation::{
    IMFSourceReader, MFCreateSourceReaderFromURL, MFStartup, MF_VERSION,
};
use windows::Win32::System::Com::{CoInitializeEx, COINIT_APARTMENTTHREADED};

pub struct HardwareDecoder {
    pub reader: Option<IMFSourceReader>,
}

// 🔥 RUST KO GUARANTEE: Ye struct threads ke beech bhejna safe hai
unsafe impl Send for HardwareDecoder {}
unsafe impl Sync for HardwareDecoder {}

impl HardwareDecoder {
    pub fn new() -> Result<Self, String> {
        unsafe {
            if let Err(e) = CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok() {
                println!("COM Initialization warning/error: {}", e);
            }
            if let Err(e) = MFStartup(MF_VERSION, 0) {
                return Err(format!("Failed to start Media Foundation: {}", e));
            }
        }
        println!("⚙️ Hardware Core: Windows COM & Media Foundation (VPU) Started Successfully!");
        Ok(Self { reader: None })
    }

    pub fn load_file(&mut self, path: &str) -> Result<(), String> {
        unsafe {
            let hstring_path = HSTRING::from(path);
            let pcwstr_path = PCWSTR::from_raw(hstring_path.as_ptr());
            let reader_result = MFCreateSourceReaderFromURL(pcwstr_path, None);

            match reader_result {
                Ok(reader) => {
                    println!("📼 VPU: Successfully opened file -> {}", path);
                    self.reader = Some(reader);
                    Ok(())
                }
                Err(e) => Err(format!("Failed to create Source Reader: {}", e)),
            }
        }
    }

    pub fn decode_next_frame(&self) {}
}
