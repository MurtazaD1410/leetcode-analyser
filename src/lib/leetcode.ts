export interface TabInfo {
  id?: number;
  url: string;
  title: string;
  isProblem: boolean;
}

export async function getActiveTab(): Promise<TabInfo> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const url = tab?.url ?? "";
  return {
    id: tab?.id,
    url,
    title: (tab?.title ?? "").replace(/\s*-\s*LeetCode.*$/i, "").trim(),
    isProblem: /^https:\/\/leetcode\.(com|cn)\/problems\//.test(url)
  };
}

// Runs inside the page (MAIN world) so it can reach LeetCode's Monaco editor.
function readEditor(): { code: string; language: string } {
  let code = "";
  let language = "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).monaco;
    const models = (monaco?.editor?.getModels?.() ?? []) as any[];
    models.sort((a, b) => b.getValue().length - a.getValue().length);
    if (models[0]) {
      code = models[0].getValue();
      language = models[0].getLanguageId?.() ?? models[0].getModeId?.() ?? "";
    }
  } catch {}
  if (!code) {
    // Fallback: only the lines currently rendered by the virtualized editor
    const lines = Array.from(document.querySelectorAll(".view-lines .view-line"));
    code = lines.map((l) => (l.textContent ?? "").replace(/\u00a0/g, " ")).join("\n");
  }
  return { code, language };
}

export async function readCode(tabId: number) {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", func: readEditor });
  return (res?.result ?? { code: "", language: "" }) as { code: string; language: string };
}
