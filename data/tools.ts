export const toolCatalog = {
  cursor: {
    label: 'Cursor',
    plans: ['Hobby', 'Pro', 'Business', 'Enterprise'],
    default: 'Pro'
  },
  copilot: {
    label: 'GitHub Copilot',
    plans: ['Individual', 'Business', 'Enterprise'],
    default: 'Individual'
  },
  claude: {
    label: 'Claude',
    plans: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API'],
    default: 'Pro'
  },
  chatgpt: {
    label: 'ChatGPT',
    plans: ['Plus', 'Team', 'Enterprise', 'API'],
    default: 'Plus'
  },
  anthropic: {
    label: 'Anthropic API',
    plans: ['API'],
    default: 'API'
  },
  openai: {
    label: 'OpenAI API',
    plans: ['API'],
    default: 'API'
  },
  gemini: {
    label: 'Gemini',
    plans: ['Pro', 'Ultra', 'API'],
    default: 'Pro'
  },
  windsurf: {
    label: 'Windsurf',
    plans: ['Pro', 'Team', 'Enterprise', 'API'],
    default: 'Pro'
  }
} as const;

export const supportedToolKeys = ['cursor', 'copilot', 'claude', 'chatgpt', 'anthropic', 'openai', 'gemini', 'windsurf'] as const;

export const toolOptions = Object.entries(toolCatalog).map(([key, config]) => ({
  key,
  label: config.label,
  plans: config.plans
}));
