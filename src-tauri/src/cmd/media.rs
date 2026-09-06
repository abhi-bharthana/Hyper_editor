use crate::models::state::VideoEngineState;
use tauri::State;

#[tauri::command]
pub fn load_video(path: String, state: State<'_, VideoEngineState>) -> Result<String, String> {
    let mut decoder_lock = state.inner().decoder.lock().unwrap();

    if let Some(decoder) = decoder_lock.as_mut() {
        decoder.load_file(&path)?;
        Ok(format!("Loaded successfully: {}", path))
    } else {
        Err("Hardware Decoder is not initialized!".to_string())
    }
}
