export default {
  title: 'Settings',
  subtitle: 'Theme, language, and AI interpretation',
  lastUpdated: 'Last updated: April 2026',

  section: {
    theme: {
      title: 'Theme',
      hint: 'Switches the visual style. Birth input and AI chat history are preserved.',
    },
    language: {
      title: 'Language',
      hint: 'Affects navigation, terminology, and AI output language.',
    },
    ai: {
      title: 'AI Interpretation',
      lead: 'After you configure your own API key, every divination module can use AI for natural-language interpretation and multi-turn Q&A. We do not collect your key or proxy any LLM request.',
      providerLabel: 'Provider',
      providerOption: {
        deepseek: 'DeepSeek (OpenAI-compatible API)',
      },
      apiKey: {
        label: 'API key',
        placeholder: 'Paste your DeepSeek API key (starts with sk-)',
        show: 'Show',
        hide: 'Hide',
        hint: 'Stored only in this browser\'s localStorage — not uploaded, not synced.',
        clear: 'Clear key',
      },
      model: {
        label: 'Model',
        hint: 'V4 Flash for everyday use; V4 Pro for deeper, slower reasoning.',
      },
      temperature: {
        label: 'Temperature (creativity)',
        hint: 'Range 0.0 – 2.0. Lower = more conservative; higher = more divergent.',
        min: '0.0 · conservative',
        max: '2.0 · divergent',
      },
      baseUrl: {
        label: 'Base URL',
        placeholder: 'https://api.deepseek.com',
        hint: 'Usually unchanged. Set this only for self-hosted proxies or regional mirrors.',
        useDefault: 'Reset to default',
      },
      test: {
        button: 'Test connection',
        running: 'Testing…',
        ok: '✓ Connection OK',
        fail: '✗ Connection failed: ',
        missingKey: 'Enter an API key first',
      },
      sessions: {
        title: 'Chat history',
        countLabel: 'Current sessions',
        messagesLabel: 'Total messages',
        clearButton: 'Clear all AI chat history',
        clearConfirm: 'This will delete all {count} locally saved AI chats. This cannot be undone — proceed?',
        cleared: 'Chat history cleared',
      },
      privacy: {
        title: 'Privacy & safety',
        items: [
          'Your API key is stored only in this browser\'s localStorage. Clearing site data or switching devices means re-entering it.',
          'Every request is sent directly from your browser to DeepSeek. We do not proxy or relay any traffic.',
          'We do not collect, store, or analyze any chat content. To mitigate key leakage, rotate the key from the DeepSeek console regularly.',
        ],
        privacyLink: 'Read the full privacy policy →',
      },
    },
  },
}
