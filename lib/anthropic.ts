import { Anthropic } from '@anthropic-ai/sdk';

const SUMMARY_TIMEOUT_MS = 8_000;

export async function generateAuditSummary(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('Anthropic API key not configured; skipping summary generation');
    return '';
  }

  const client = new Anthropic({ apiKey, timeout: SUMMARY_TIMEOUT_MS });

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 220,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.type === 'text' ? textBlock.text.trim() : '';
  } catch (error) {
    console.error('Anthropic summary failed', error);
    return '';
  }
}
