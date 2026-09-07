use windows::Win32::System::Com::{CoInitializeEx, COINIT_APARTMENTTHREADED};
use windows::Win32::Media::MediaFoundation::{
    MFStartup, MF_VERSION, IMFSourceReader, MFCreateSourceReaderFromURL,
    MFCreateMediaType, IMFMediaType, MF_MT_MAJOR_TYPE, MF_MT_SUBTYPE, 
    MFMediaType_Video, MFVideoFormat_RGB32, MF_SOURCE_READER_FIRST_VIDEO_STREAM,
    IMFSample, IMFAttributes, MFCreateAttributes, MF_SOURCE_READER_ENABLE_VIDEO_PROCESSING
};
use windows::core::{HSTRING, PCWSTR};
use std::ptr;
use std::slice;

pub struct HardwareDecoder {
    pub reader: Option<IMFSourceReader>,
}

unsafe impl Send for HardwareDecoder {}
unsafe impl Sync for HardwareDecoder {}

impl HardwareDecoder {
    pub fn new() -> Result<Self, String> {
        unsafe {
            if let Err(e) = CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok() {
                println!("COM Initialization warning: {}", e);
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
            
            // 🔥 FIX: C-style Out-Pointer approach for creating Attributes
            let mut attributes_opt: Option<IMFAttributes> = None;
            MFCreateAttributes(&mut attributes_opt, 1).map_err(|e| e.to_string())?;
            let attributes = attributes_opt.ok_or("Failed to create IMFAttributes")?;
            
            attributes.SetUINT32(&MF_SOURCE_READER_ENABLE_VIDEO_PROCESSING, 1).map_err(|e| e.to_string())?;
            
            let reader_result = MFCreateSourceReaderFromURL(pcwstr_path, Some(&attributes));

            match reader_result {
                Ok(reader) => {
                    let media_type: IMFMediaType = MFCreateMediaType().map_err(|e| e.to_string())?;
                    media_type.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video).map_err(|e| e.to_string())?;
                    media_type.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_RGB32).map_err(|e| e.to_string())?;

                    reader.SetCurrentMediaType(MF_SOURCE_READER_FIRST_VIDEO_STREAM.0 as u32, None, &media_type)
                          .map_err(|e| e.to_string())?;

                    println!("📼 VPU: Successfully configured hardware decoder for -> {}", path);
                    self.reader = Some(reader);
                    Ok(())
                }
                Err(e) => Err(format!("Failed to create Source Reader: {}", e))
            }
        }
    }

    pub fn decode_next_frame(&self) -> Option<Vec<u8>> {
        let reader = self.reader.as_ref()?;
        
        unsafe {
            let mut stream_index = 0;
            let mut flags = 0;
            let mut timestamp = 0;
            let mut sample_opt: Option<IMFSample> = None;

            if reader.ReadSample(
                MF_SOURCE_READER_FIRST_VIDEO_STREAM.0 as u32,
                0,
                Some(&mut stream_index),
                Some(&mut flags),
                Some(&mut timestamp),
                Some(&mut sample_opt),
            ).is_err() {
                return None; 
            }

            if let Some(sample) = sample_opt {
                if let Ok(buffer) = sample.ConvertToContiguousBuffer() {
                    let mut mem_ptr = ptr::null_mut();
                    let mut current_length = 0;
                    
                    if buffer.Lock(&mut mem_ptr, None, Some(&mut current_length)).is_ok() {
                        let pixel_data = slice::from_raw_parts(mem_ptr as *const u8, current_length as usize);
                        let mut vec_data = pixel_data.to_vec();

                        for i in (0..vec_data.len()).step_by(4) {
                            let blue = vec_data[i];
                            vec_data[i] = vec_data[i+2]; 
                            vec_data[i+2] = blue;        
                        }

                        let _ = buffer.Unlock();
                        return Some(vec_data);
                    }
                }
            }
            None
        }
    }
}