#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Apne naye modules ko import karo
mod cmd;
mod engine;
mod models;

use models::state::VideoEngineState;

fn main() {
    // Engine state initialize karo
    let app_state = VideoEngineState::new();

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_opener::init()) 
        .plugin(tauri_plugin_dialog::init()) // 🔥 YE LINE NAYI HAI: Dialog Plugin On!
        .register_uri_scheme_protocol("hyper", |_app, _request| {
            // Dummy Blue Frame Generator
            let width = 1280;
            let height = 720;
            let mut frame_data = vec![0u8; width * height * 4];
            
            for i in (0..frame_data.len()).step_by(4) {
                frame_data[i] = 13;       
                frame_data[i+1] = 13;     
                frame_data[i+2] = 20;     
                frame_data[i+3] = 255;    
            }

            tauri::http::Response::builder()
                .header("Access-Control-Allow-Origin", "*")
                .header("Content-Type", "application/octet-stream")
                .status(200)
                .body(frame_data)
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