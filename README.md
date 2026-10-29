# LeetCode Analyser

A Chrome side panel extension that analyzes your LeetCode solution with Gemini and shows its time and space complexity. Built with React and TypeScript, featuring growth charts, a "best possible" comparison, and better-approach suggestions, all in a LeetCode-style dark theme.

## ✨ Features

* **Side Panel**: Stays open next to LeetCode as you switch tabs, like the bookmarks panel
* **One-Click Analysis**: Press Analyze and your code is read straight from the LeetCode editor
* **Time & Space Complexity**: Exact Big-O notation with a short explanation for each
* **Growth Charts**: Your complexity plotted against O(1), O(log n), O(n), O(n log n), O(n²), O(n³), O(2ⁿ) and O(n!)
* **Best Possible Comparison**: A dashed line on each chart shows the best known complexity for the problem
* **Verdict Badges**: Optimal, Can improve, or Far from optimal, judged separately for time and space
* **Better Approach Suggestions**: Names a faster or leaner approach and explains the trade-off
* **LeetCode Dark Theme**: LeetCode's orange and green on a dark background
* **Configurable Model**: Choose any Gemini model from the settings screen
* **Bring Your Own Key**: Your Gemini API key is stored only in your browser

## 🚀 Tech Stack

* **Frontend**: React 18, TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS v4
* **UI Components**: shadcn/ui-style components (Radix Slot, class-variance-authority)
* **Charts**: Recharts
* **Icons**: Lucide React
* **Extension Platform**: Chrome Manifest V3 with the Side Panel API
* **AI**: Google Gemini API

## 📦 Installation

### Prerequisites

* Node.js 20+
* npm, yarn, pnpm, or bun
* Google Chrome 114+ (required for the Side Panel API)
* A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

1. **Clone the repository**

```
git clone https://github.com/MurtazaD1410/leetcode-analyser.git
cd leetcode-analyser
```

2. **Install dependencies**

```
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Build the extension**

```
npm run build
```

This creates a `dist/` folder containing the extension.

4. **Load it into Chrome**

   * Open `chrome://extensions`
   * Turn on **Developer mode**
   * Click **Load unpacked** and select the `dist/` folder

5. **Add your Gemini API key**

   * Click the extension icon in the toolbar to open the side panel
   * Click the gear icon
   * Paste your API key and choose a model (for example `gemini-3.8-flash`)
   * Click **Save**

6. **Analyze a solution**

   * Open any problem at `leetcode.com/problems/...`
   * Write or paste your solution in the editor
   * Press **Analyze** in the side panel

### Development

```
npm run dev          # start the Vite dev server
npm run typecheck    # run the TypeScript compiler without emitting files
npm run build        # production build into dist/
```

After rebuilding, click the reload icon on the extension in `chrome://extensions` to pick up the changes.

## 🧠 How It Works

1. The side panel reads your code from LeetCode's Monaco editor in the active tab.
2. The code is sent to the Gemini API, which returns the complexity of your solution and the best known complexity for the problem.
3. The panel compares the two and renders the badges, charts, and suggestions.

Your API key is stored in `chrome.storage.sync`, and your code is sent only to the Gemini API when you press Analyze.

## ⚠️ Good to Know

* **AI estimate**: Results come from an LLM and can be wrong, especially for amortized or recursive solutions. The "best possible" complexity is Gemini's judgment, not a proof.
* **Rate limits**: Limits depend on your Gemini tier and model, and the free tier has a small daily request cap. Check your quotas at [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit).
* **Opening the panel**: Chrome requires one click on the toolbar icon to open the side panel. After that it stays open across tabs.
* **Windows build error**: If `npm run build` fails with a `rolldown` "Cannot find native binding" error, delete `node_modules` and `package-lock.json`, then run `npm install` again.

⭐ If you found this project helpful, please give it a star on GitHub!
