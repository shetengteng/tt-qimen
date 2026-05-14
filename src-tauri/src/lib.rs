//! tt-qimen Tauri shell
//!
//! 设计原则：不实现任何业务 command，只挂必要 plugin。
//! 业务代码在 Vue SPA 中跑，Webview 直接 fetch 各 AI Provider。
//!
//! 已挂载 plugin:
//!   - tauri-plugin-window-state: 记忆窗口尺寸/位置/最大化状态
//!   - tauri-plugin-updater: GitHub Releases latest.json 自动更新
//!
//! 扩展点：
//!   - 如需暴露 IPC command，在 commands.rs 中以 #[tauri::command] 标注，
//!     并在此处 .invoke_handler(tauri::generate_handler![...]) 注册。

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                if let Some(window) = _app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tt-qimen");
}
