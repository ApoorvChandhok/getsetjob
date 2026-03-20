# How to Run the GetSetJob UI Locally

## 🚀 Recommended: Start Everything at Once (UI + Both Bots)

Run this single command from PowerShell to start **all three services** simultaneously:

```powershell
cd "e:\EXTRAS\Antigravity\Getsetjob"
.\START_ALL.ps1
```

This will open **two separate terminal windows** for the bots and start the Next.js UI in the current terminal.

| Service         | URL                        |
|-----------------|---------------------------|
| GetSetJob UI    | http://localhost:3000      |
| LinkedIn Bot    | http://localhost:5000      |
| Naukri Bot      | http://localhost:5001      |

---

## Manual Start (UI only)

If you only want the Next.js UI without the bots:

```powershell
cd "e:\EXTRAS\Antigravity\Getsetjob"
npm install   # Only needed after pulling new updates
npm run dev
```

Then open **http://localhost:3000** in your browser.

To stop any server, press **`Ctrl + C`** in its terminal window.
