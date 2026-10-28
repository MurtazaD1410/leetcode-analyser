import { DEFAULT_MODEL } from "./gemini";

export interface Settings {
  apiKey: string;
  model: string;
}

export async function loadSettings(): Promise<Settings> {
  const s = await chrome.storage.sync.get(["apiKey", "model"]);
  return { apiKey: (s.apiKey as string) ?? "", model: (s.model as string) ?? DEFAULT_MODEL };
}

export async function saveSettings(s: Settings) {
  await chrome.storage.sync.set({ apiKey: s.apiKey.trim(), model: s.model.trim() || DEFAULT_MODEL });
}
