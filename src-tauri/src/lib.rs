#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                let _ = app.handle();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running AGT Product AI");
}
