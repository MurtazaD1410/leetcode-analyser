import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Settings as SettingsIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { gap } from "@/lib/complexity";
import { DEFAULT_MODEL, analyzeWithGemini, type AnalysisResult } from "@/lib/gemini";
import { getActiveTab, readCode, type TabInfo } from "@/lib/leetcode";
import { loadSettings, saveSettings, type Settings } from "@/lib/settings";

const TIME_COLOR = "#ffa116"; // LeetCode orange
const SPACE_COLOR = "#2cbb5d"; // LeetCode green

export default function App() {
  const [view, setView] = useState<"analyze" | "settings">("analyze");
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [settings, setSettings] = useState<Settings>({ apiKey: "", model: DEFAULT_MODEL });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultFor, setResultFor] = useState("");

  const refreshTab = useCallback(async () => setTab(await getActiveTab()), []);

  useEffect(() => {
    loadSettings().then(setSettings);
    refreshTab();
    const onActivated = () => refreshTab();
    const onUpdated = (_id: number, change: { status?: string; url?: string; title?: string }) => {
      if (change.status === "complete" || change.url || change.title) refreshTab();
    };
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [refreshTab]);

  // Hide stale results when you move to a different problem
  const problemKey = tab?.url.split("?")[0].split("/description")[0] ?? "";
  const showResult = result && resultFor === problemKey;

  async function analyze() {
    if (!tab?.id) return;
    setError("");
    if (!settings.apiKey) {
      setView("settings");
      return;
    }
    setLoading(true);
    try {
      const { code, language } = await readCode(tab.id);
      if (!code.trim()) throw new Error("Couldn't read code from the editor. Is the problem editor open?");
      const res = await analyzeWithGemini({ ...settings, code, language, title: tab.title });
      setResult(res);
      setResultFor(problemKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  if (view === "settings") {
    return <SettingsView settings={settings} onSave={async (s) => { await saveSettings(s); setSettings(s); setView("analyze"); }} onBack={() => setView("analyze")} />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-3 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Zap className="size-5 text-primary" />
          Complexity
        </div>
        <Button variant="ghost" size="icon" onClick={() => setView("settings")} aria-label="Settings">
          <SettingsIcon />
        </Button>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Current problem</div>
            <div className="truncate text-sm font-medium">
              {tab?.isProblem ? tab.title || "LeetCode problem" : "Open a LeetCode problem to start"}
            </div>
          </div>
          <Button onClick={analyze} disabled={loading || !tab?.isProblem}>
            {loading ? <Loader2 className="animate-spin" /> : <Zap />}
            {loading ? "Analyzing…" : showResult ? "Analyze again" : "Analyze"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {showResult && (
        <>
          <MetricCard title="Time complexity" metric={result.time} optimal={result.optimalTime} color={TIME_COLOR} />
          <MetricCard title="Space complexity" metric={result.space} optimal={result.optimalSpace} color={SPACE_COLOR} />
          <ApproachCard result={result} />
          <p className="text-center text-xs text-muted-foreground">
            AI estimate. Double-check unusual or amortized cases.
          </p>
        </>
      )}
    </div>
  );
}

function SettingsView({ settings, onSave, onBack }: { settings: Settings; onSave: (s: Settings) => void; onBack: () => void }) {
  const [draft, setDraft] = useState(settings);
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-3 p-4">
      <header className="flex items-center gap-2 font-semibold">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        Settings
      </header>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Gemini API key
            <Input type="password" value={draft.apiKey} onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })} placeholder="From Google AI Studio" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Model
            <Input value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} placeholder={DEFAULT_MODEL} />
          </label>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}


function ApproachCard({ result }: { result: AnalysisResult }) {
  const improvable =
    gap(result.time.classId, result.optimalTime.classId) > 0 ||
    gap(result.space.classId, result.optimalSpace.classId) > 0;

  if (!improvable) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 pt-4 text-sm">
          <Badge variant="success">Optimal</Badge>
          No better approach is known. This is as good as it gets for this problem.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Better approach</div>
          <Badge variant="warning">Can improve</Badge>
        </div>
        {result.approach && <div className="text-sm font-semibold">{result.approach}</div>}
        {result.advice && <p className="text-sm leading-relaxed text-foreground/80">{result.advice}</p>}
      </CardContent>
    </Card>
  );
}
