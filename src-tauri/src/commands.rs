//! 业务 IPC command 扩展点
//!
//! 当前为空。未来若需要(如：本地命盘历史导出 CSV、把 API Key 迁移到 keyring)，
//! 在此 #[tauri::command] 标注函数，并在 lib.rs 的 .invoke_handler 注册。
//!
//! 示例：
//!
//! ```ignore
//! #[tauri::command]
//! pub fn greet(name: &str) -> String {
//!     format!("Hello, {name}!")
//! }
//! ```
//!
//! 然后在 lib.rs：
//!
//! ```ignore
//! .invoke_handler(tauri::generate_handler![commands::greet])
//! ```
