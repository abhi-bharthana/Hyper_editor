#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod engine;
mod models;

use models::state::VideoEngineState;
use tauri::Manager;

fn main() {
    let app_state = VideoEngineState::new();

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_opener::init()) 
        .plugin(tauri_plugin_dialog::init()) 
        .register_uri_scheme_protocol("hyper", |app, _request| {
            
            // 🔥 FIX: Added .app_handle() before .state()
            let state = app.app_handle().state::<VideoEngineState>();
            let mut extracted_frame = None;

            {
                let decoder_lock = state.decoder.lock().unwrap();
                if let Some(decoder) = decoder_lock.as_ref() {
                    extracted_frame = decoder.decode_next_frame();
                }
            }

            let final_frame = match extracted_frame {
                Some(frame_data) => frame_data,
                None => {
                    let width = 1280;
                    let height = 720;
                    let mut fallback = vec![0u8; width * height * 4];
                    for i in (0..fallback.len()).step_by(4) {
                        fallback[i] = 13;       
                        fallback[i+1] = 13;     
                        fallback[i+2] = 20;     
                        fallback[i+3] = 255;    
                    }
                    fallback
                }
            };

            tauri::http::Response::builder()
                .header("Access-Control-Allow-Origin", "*")
                .header("Content-Type", "application/octet-stream")
                .status(200)
                .body(final_frame)
                .unwrap()
        })
        .invoke_handler(tauri::generate_handler![
            cmd::playback::play_video, 
            cmd::playback::pause_video,
            cmd::media::load_video 
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Hyper Editor backend");
}