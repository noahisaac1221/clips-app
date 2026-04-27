# ClipOps App

AI-powered TikTok clip generator. Upload a transcript → Claude finds the best clips → render to 9:16 vertical in the browser → download + copy caption.

---

## Local development

```bash
cd clipops-app
npm install
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Run the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Cloudflare Pages

### One-time setup

**1. Create a Cloudflare Pages project**
- Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
- Go to **Workers & Pages → Create → Pages**
- Connect your GitHub repo
- Set **Build command**: `cd clipops-app && npx @cloudflare/next-on-pages@1`
- Set **Build output directory**: `clipops-app/.vercel/output/static`
- Save

**2. Add your API key**
- In the Pages project → **Settings → Environment variables**
- Add: `ANTHROPIC_API_KEY` = your key (mark as Secret)
- Add it to both **Production** and **Preview** environments

**3. Push to GitHub**
Every push to `main` triggers a deploy automatically.

---

### GitHub Actions deploy (alternative)

Add these secrets to your GitHub repo (**Settings → Secrets → Actions**):

| Secret | Where to find it |
|--------|-----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar on any page |

Then push to `main` — the workflow in `.github/workflows/deploy.yml` handles everything.

---

## How to use

1. **Select your account** — A (male motivation) or B (female nostalgia)
2. **Paste your transcript** — any timestamped format works: `[00:00]`, `00:00:00`, SRT, plain timestamped text
3. Click **Find best clips** — Claude scans every line and ranks viral-ready moments
4. **Review the ranked clips** — each shows hook/payoff/shareability/niche-fit scores, a reason, and 3 ready-to-copy TikTok captions
5. Click **Select this clip** on the one you want
6. **Upload your downloaded video** — drag and drop the MP4
7. Click **Render clip** — the browser trims and converts to 9:16 with blurred bars (no upload, runs locally)
8. **Download** the rendered clip and **copy** the caption

---

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router)
- [Cloudflare Pages](https://pages.cloudflare.com) (hosting + edge functions)
- [Anthropic Claude](https://anthropic.com) (clip analysis, scoring, captions)
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app) (client-side video rendering — no server upload)
- [Tailwind CSS](https://tailwindcss.com)
