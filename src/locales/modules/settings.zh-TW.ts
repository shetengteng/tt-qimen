export default {
  title: '設定',
  subtitle: '主題、語言與 AI 解讀設定',
  lastUpdated: '更新於 2026 年 4 月',

  section: {
    theme: {
      title: '主題',
      hint: '切換站點視覺風格；切換不會清除生辰輸入或 AI 對話。',
    },
    language: {
      title: '語言',
      hint: '影響導覽、術語庫與 AI 輸出語種。',
    },
    ai: {
      title: 'AI 解讀',
      lead: '設定自帶 API Key 後，即可在每個排盤頁面使用 AI 做自然語言解讀與多輪問答。本站不收集你的 Key，也不代理任何 LLM 請求。',
      providerLabel: '服務商',
      providerOption: {
        deepseek: 'DeepSeek（OpenAI 相容協議）',
      },
      apiKey: {
        label: 'API Key',
        placeholder: '貼上你的 DeepSeek API Key（以 sk- 開頭）',
        show: '顯示',
        hide: '隱藏',
        hint: 'Key 僅儲存於本機瀏覽器 localStorage，不會上傳、不同步。',
        clear: '清空 Key',
      },
      model: {
        label: '模型',
        hint: '日常建議用 V4 Flash；需要嚴密推演選 V4 Pro。',
      },
      temperature: {
        label: '溫度（創造性）',
        hint: '範圍 0.0 – 2.0；越低越保守，越高越發散。',
        min: '0.0 · 保守',
        max: '2.0 · 發散',
      },
      baseUrl: {
        label: 'Base URL',
        placeholder: 'https://api.deepseek.com',
        hint: '一般無需修改；自建反代或區域鏡像時填入。',
        useDefault: '恢復預設',
      },
      test: {
        button: '測試連線',
        running: '正在測試…',
        ok: '✓ 連線正常',
        fail: '✗ 連線失敗：',
        missingKey: '請先填入 API Key',
      },
      sessions: {
        title: '對話歷史',
        countLabel: '目前會話數',
        messagesLabel: '總訊息數',
        clearButton: '清空所有 AI 對話',
        clearConfirm: '將刪除全部 {count} 條本機儲存的 AI 對話歷史。此操作不可復原，確定嗎？',
        cleared: '已清空全部對話',
      },
      privacy: {
        title: '隱私與安全',
        items: [
          'API Key 僅儲存於本機瀏覽器 localStorage；清快取或換設備後需要重新填入。',
          '所有對話由你的瀏覽器直接傳送給 DeepSeek，不經過本站任何後端中轉。',
          '本站不收集、不儲存、不分析任何對話內容；如擔心 Key 外洩，請定期至 DeepSeek 控制台輪換。',
        ],
        privacyLink: '查看完整隱私政策 →',
      },
    },
  },
}
