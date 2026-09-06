use crate::models::state::VideoEngineState;
use tauri::State;

#[tauri::command]
pub fn play_video(state: State<'_, VideoEngineState>) {
    // .inner() se hum direct VideoEngineState ko access karte hain
    let mut is_playing = state.inner().is_playing.lock().unwrap();
    *is_playing = true;
    println!("▶️ Rust VPU: Playback started. Streaming frames...");
}

#[tauri::command]
pub fn pause_video(state: State<'_, VideoEngineState>) {
    let mut is_playing = state.inner().is_playing.lock().unwrap();
    *is_playing = false;
    println!("⏸️ Rust VPU: Playback paused.");
}
