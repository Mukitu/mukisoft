# MukiSoft — Vercel Deployment Guide (Bangla + English)

> এই গাইড ফলো করলে আপনার **MukiSoft** প্রজেক্ট Vercel-এ deploy হবে এবং **page reload-এ 404 error** আসবে না।

This guide shows how to deploy MukiSoft to Vercel via GitHub and fixes the dreaded **404 on page reload** issue.

---

## 🧰 Prerequisites

- একটা GitHub account (আপনার কোড রাখার জন্য)
- একটা Vercel account → https://vercel.com (GitHub দিয়ে sign up করুন)
- একটা Supabase project (database + auth এর জন্য) — যদি আপনার কাছে না থাকে, https://supabase.com এ গিয়ে ফ্রি-তে বানিয়ে নিন
- আপনার কম্পিউটারে ইনস্টল থাকতে হবে: **Node.js 18+**, **Git**

---

## 🚀 Part 1 — কোডটা GitHub-এ রাখুন (Push to GitHub)

### Step 1: গিট ইনিশিয়ালাইজ করুন

টার্মিনালে প্রজেক্ট ফোল্ডারে যান:

```bash
cd /path/to/Mukisoft
```

যদি আগে থেকে git init করা না থাকে:

```bash
git init
git branch -m main
```

### Step 2: সব ফাইল যোগ করুন

> ⚠️ **Important:** `.env.local` কখনো commit করবেন না। `.gitignore` ফাইলে আগে থেকেই `node_modules/`, `.next/`, `.env*` ignore করা আছে।

```bash
git add .
git status
```

`git status` এ যেন `.env.local` বা `node_modules` না দেখায়। যদি দেখায়, `.gitignore` চেক করুন।

### Step 3: প্রথম commit

```bash
git commit -m "Initial commit: MukiSoft ready for Vercel deploy"
```

### Step 4: GitHub repository তৈরি করুন

1. https://github.com এ লগইন করুন
2. উপরে ডানে **+** বাটন → **New repository** ক্লিক করুন
3. Repository name দিন: `mukisoft` (যা আপনি পছন্দ করেন)
4. **Public** বা **Private** সিলেক্ট করুন
5. ⚠️ **"Initialize with README" চেকবক্সটা দেবেন না** (কারণ আমাদের লোকাল কোড আছে)
6. **Create repository** ক্লিক করুন

### Step 5: GitHub-এ push করুন

GitHub যে URL দেখাবে সেটা কপি করুন (যেমন `https://github.com/your-username/mukisoft.git`)। তারপর:

```bash
git remote add origin https://github.com/your-username/mukisoft.git
git push -u origin main
```

আপনার GitHub username/password দিন — **Personal Access Token** লাগতে পারে (https://github.com/settings/tokens এ গিয়ে বানান)।

✅ কোড এখন GitHub-এ আছে!

---

## ☁️ Part 2 — Vercel-এ Deploy করুন

### Step 1: Vercel-এ GitHub কানেক্ট করুন

1. https://vercel.com এ যান এবং লগইন করুন
2. **Add New…** → **Project** ক্লিক করুন
3. **Import Git Repository** এ আপনার `mukisoft` repo সিলেক্ট করুন
4. **Import** ক্লিক করুন

### Step 2: Project Configure করুন

Vercel স্বয়ংক্রিয়ভাবে Next.js detect করবে। এই settings গুলো চেক করুন:

| Setting | Value |
|---|---|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `./` (খালি রাখুন) |
| **Build Command** | `next build` |
| **Output Directory** | (খালি রাখুন — Next.js নিজেই হ্যান্ডেল করে) |
| **Install Command** | `npm install` |
| **Node Version** | `20.x` (recommended) |

### Step 3: Environment Variables যোগ করুন

**Environment Variables** সেকশনে একটা একটা করে যোগ করুন (তারপর deploy):

```
NEXT_PUBLIC_SUPABASE_URL          = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY         = eyJhbGciOiJIUzI1NiIsInR5cCI6...   (optional)
LIBRETRANSLATE_URL                = https://libretranslate.example.com   (optional)
LIBRETRANSLATE_API_KEY            = your-key                              (optional)
MYMEMORY_EMAIL                    = you@example.com                       (optional)
```

এগুলো আপনার `.env.local` ফাইলে যা আছে সেগুলো থেকে কপি করুন। Supabase values গুলো https://app.supabase.com → Project → Settings → API থেকে পাবেন।

### Step 4: Deploy!

**Deploy** বাটন চাপুন। Vercel:
1. আপনার কোড clone করবে
2. `npm install` চালাবে
3. `next build` চালাবে
4. একটা URL দেবে যেমন: `https://mukisoft-xyz.vercel.app`

🎉 আপনার সাইট লাইভ!

---

## 🛠️ Part 3 — পরে Update push করুন

প্রতিবার কোড পরিবর্তন করার পর:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel **automatic নতুন deploy** শুরু করবে (প্রতিটা push-এ)। আপনাকে manually কিছু করতে হবে না।

---

## 🔁 Part 4 — "404 on page reload" সমস্যা ও তার ফিক্স

### সমস্যাটা কী?

আপনি যখন `/en/about` পেজে ব্রাউজ করছেন এবং browser-এ **Reload (F5)** বা **refresh** দিচ্ছেন, Vercel মাঝে মাঝে **404 Not Found** দেখায়। কিন্তু সরাসরি `/` থেকে navigation করলে কাজ করে।

### কেন হয়?

MukiSoft প্রজেক্টটা **next-intl** দিয়ে locale routing করে (`/en/...`, `/bn/...`)। Vercel-এর CDN deep path গুলো যখন static file হিসেবে খোঁজে, তখন Next.js এর dynamic route-এর সাথে mismatch হয়ে যায়। এটা `next-intl` + Vercel এর একটা known edge case।

### ✅ এই প্রজেক্টে যা ফিক্স করা হয়েছে

এই repo-তে ৩টা জায়গায় fix দেওয়া আছে:

#### 1. `vercel.json` (নতুন ফাইল — যোগ করা হয়েছে)

প্রজেক্ট রুটে একটা `vercel.json` আছে যেটা Vercel-কে বলে দেয় যে এটা Next.js প্রজেক্ট এবং কোন region-এ deploy হবে (`sin1` — Singapore, বাংলাদেশের কাছে)।

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": "nextjs",
  "regions": ["sin1"],
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/((?!api|_next/static|_next/image|favicon.ico|mukisoftadmin).*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### 2. `middleware.ts` (আপডেট করা হয়েছে)

`middleware.ts` ফাইলে এখন **unknown locale catch** আছে। অর্থাৎ, কেউ যদি `/fr/about` (যেটা supported না) visit করে এবং reload দেয়, তাহলে 404 না দেখিয়ে user-কে সঠিক locale-এ redirect করবে।

#### 3. `next.config.mjs` (আপডেট করা হয়েছে)

Image config, security headers এবং Vercel-এর সাথে সঠিকভাবে কাজ করার জন্য headers যোগ করা হয়েছে।

### 🧪 ফিক্স কাজ করছে কিনা যেভাবে পরীক্ষা করবেন

Deploy হওয়ার পর:

1. `https://your-app.vercel.app/en/about` এ যান
2. Browser-এ **F5** চাপুন — reload হয়ে same page আসা উচিত, 404 না
3. `/bn/services/web-development` এ যান এবং reload দিন
4. সব internal link এ click করে deep path-এ যান, তারপর reload দিন

সবই কাজ করবে ✅।

---

## 🌐 Part 5 — Custom Domain সেটআপ (Optional)

### Step 1: Domain কিনুন

যেকোনো registrar থেকে domain কিনুন (Namecheap, GoDaddy, Cloudflare Registrar ইত্যাদি)।

### Step 2: Vercel-এ Domain Add করুন

1. Vercel Dashboard → আপনার Project → **Settings** → **Domains**
2. আপনার domain লিখুন (যেমন `mukisoft.tech`) → **Add**
3. Vercel আপনাকে DNS records দেবে

### Step 3: DNS Configure করুন

আপনার registrar-এর DNS settings এ গিয়ে:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Save করুন। Propagation ৫-৩০ মিনিট লাগতে পারে।

### Step 4: Site URL Update করুন

`lib/config/site.ts` (অথবা যেখানে `siteConfig.url` আছে) — আপনার domain দিয়ে আপডেট করুন, commit + push করুন।

---

## 🌍 Part 6 — Supabase Production Settings

Deploy হওয়ার পর Supabase-এ যান:

1. **Authentication** → **URL Configuration**
2. **Site URL** সেট করুন: `https://your-app.vercel.app`
3. **Redirect URLs** এ যোগ করুন:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**` (wildcard — caution দিয়ে)

4. **SQL Editor** এ আপনার migrations/supabase ফোল্ডারের schema run করুন।

---

## 📋 Quick Troubleshooting

| সমস্যা (Problem) | সমাধান (Solution) |
|---|---|
| Deploy fail হচ্ছে `npm install` এ | Vercel-এর Node Version 20.x সেট করুন |
| Build error: "Module not found" | `package-lock.json` commit করেছেন কিনা দেখুন |
| 404 on reload ⚠️ | এই গাইডের Part 4 follow করুন, `vercel.json` আছে কিনা দেখুন |
| Supabase env vars কাজ করছে না | Variable names ঠিক আছে কিনা দেখুন (NEXT_PUBLIC_ prefix সহ) |
| Admin panel login কাজ করছে না | Supabase-এর Redirect URLs এ আপনার Vercel URL যোগ করুন |
| Slow first load | Vercel-এর region আপনার nearest দিন (`sin1` for BD/IN) |
| Images load হচ্ছে না | `next.config.mjs`-এ `images.remotePatterns` আছে, hostname `**` allow আছে |

---

## 🔒 Security Checklist (Production)

- [ ] `.env.local` কখনো commit হয়নি (verify: `git log --all -- .env.local`)
- [ ] Supabase RLS policies enable আছে সব table-এ
- [ ] `SUPABASE_SERVICE_ROLE_KEY` শুধু server-side এ ব্যবহার হচ্ছে, কখনো NEXT_PUBLIC_ prefix না
- [ ] Admin password strong
- [ ] Domain-এ HTTPS enable (Vercel automatic দেয়)
- [ ] Site URL env variable-এ production URL সেট করা

---

## 🖼️ Part 7 — Facebook / WhatsApp / LinkedIn Link Preview (OG Image) Fix

### সমস্যাটা কী?

আপনি `https://mukisoft.tech/en` link Facebook-এ বা WhatsApp-এ share করলে কোনো **thumbnail image** দেখায় না, বা শুধু ছোট্ট একটা ফাঁকা box দেখায়। এটা Open Graph (`og:*`) meta tags ঠিকমতো সেট না থাকলে হয়।

### কেন হয়?

৩টা প্রধান কারণ:
1. **OG image টা SVG ফরম্যাটে ছিল** — Facebook, WhatsApp, LinkedIn, Slack, Discord কেউই SVG support করে না। তাদের **PNG বা JPG** দরকার।
2. **Relative URL** — আগে `/og.svg` relative path ছিল, কিন্তু কিছু crawler (WhatsApp) `metadataBase` resolve করে না।
3. **`og:image:width`, `og:image:height`, `og:image:alt`** — এগুলো ছাড়া Facebook শুধু "small preview" বা কিছুই দেখায় না।

### ✅ এই repo-তে যা ফিক্স করা হয়েছে

| ফাইল | কী করা হয়েছে |
|---|---|
| `public/og.png` | নতুন — 1200×630 PNG (rsvg-convert দিয়ে SVG থেকে generate) |
| `public/og.jpg` | নতুন — 1200×630 JPG fallback (কিছু crawler PNG reject করে) |
| `lib/config/assets.ts` | `assetPaths.og.default` এখন `/og.png` |
| `app/[locale]/layout.tsx` | `openGraph.images` এ PNG + JPG দুটোই আছে, width/height/alt/type/secureUrl সব সেট, URL **absolute** |

### 🧪 ফিক্স কাজ করছে কিনা যেভাবে পরীক্ষা করবেন

Deploy হওয়ার পর:

1. **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
   - আপনার URL paste করুন (যেমন `https://mukisoft.tech/en`)
   - **"Debug"** চাপুন
   - নিচে **"Open Graph"** সেকশনে image preview দেখাবে
   - প্রথমবার cache miss হতে পারে — **"Scrape Again"** চাপুন

2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
   - URL দিন, **Preview Card** দেখান

3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
   - URL দিন, **Inspect** চাপুন

4. **OpenGraph.xyz:** https://www.opengraph.xyz/
   - যেকোনো URL paste করলে সব platform-এর preview একসাথে দেখায়

5. **Manual WhatsApp test:**
   - নিজের নম্বরে `https://mukisoft.tech/en` পাঠান
   - Link-এ tap না করে **long-press / preview** দেখুন — thumbnail আসা উচিত

### 🆘 যদি এখনও thumbnail না আসে

| কারণ | সমাধান |
|---|---|
| পুরানো cached preview | Facebook Debugger → **"Scrape Again"** চাপুন |
| OG image publicly accessible না | `https://mukisoft.tech/og.png` browser-এ open করুন — image আসা উচিত |
| HTTPS না | Vercel automatic HTTPS দেয়, কিন্তু custom domain DNS verify করুন |
| Image too small (< 200px) | এই fix-এ image 1200×630 — সবচেয়ে বড় recommended size |
| Image file size too big (> 8MB) | এই fix-এ PNG 142KB, JPG 71KB — safe limit-এ আছে |
| Crawler rate limit | ৫-১০ মিনিট wait করে আবার try করুন |

### 🎨 Custom OG Image চাইলে

`public/og.svg` ফাইলটা edit করুন (আপনার brand color/text/logo দিয়ে), তারপর:

```bash
rsvg-convert -w 1200 -h 630 public/og.svg -o public/og.png
convert public/og.png -quality 90 -strip public/og.jpg
git add public/og.svg public/og.png public/og.jpg
git commit -m "Update OG thumbnail"
git push
```

Vercel auto-redeploy হবে। তারপর Facebook Debugger দিয়ে cache refresh করুন।

---

## 🚨 Part 8 — "ERR_TUNNEL_CONNECTION_FAILED" / "This site can't be reached" Fix

### সমস্যাটা কী?

Browser-এ `https://www.mukisoft.tech/en/team` visit করলে:

```
This site can't be reached
The webpage at https://www.mukisoft.tech/en/team might be temporarily down
or it may have moved permanently to a new web address.
ERR_TUNNEL_CONNECTION_FAILED
```

অথবা `mukisoft.tech`-এ গেলে:

```
mukisoft.tech's server DNS address could not be found
ERR_NAME_NOT_RESOLVED
```

### 🔍 কেন হয়?

এটা **404 / hosting সমস্যা না** — এটা **DNS সমস্যা**। আপনার browser ঠিকই বলছে: domain-টার IP address-ই পাচ্ছে না।

**সবচেয়ে common কারণগুলো:**

1. **Registrar-এ DNS records সেট করা হয়নি।** Domain কিনলেই host হয় না — আপনাকে বলে দিতে হয় "এই domain-টা যাবে এই IP address-এ"।
2. **Vercel-এ domain add করা হয়নি।** Registrar-এ DNS বসালেই হবে না, Vercel-কেও জানাতে হবে যে আপনার project-এ এই domain-টা যুক্ত।
3. **Cloudflare / proxy DNS চালু আছে।** কিছু registrar (Cloudflare especially) automatic proxy on করে দেয় — Vercel-এর সাথে সরাসরি connection block হয়ে যায়।
4. **CAA record allow করছে না।** কিছো registrar-এ SSL issue হয় CAA record-এর কারণে।

### ✅ সমাধান — ধাপে ধাপে (আপনার `mukisoft.tech` এর জন্য)

#### Step 1: Vercel-এ domain যোগ করুন

1. https://vercel.com/dashboard এ যান
2. আপনার **MukiSoft project** select করুন
3. **Settings** → **Domains** tab-এ ক্লিক করুন
4. নিচের input box-এ আপনার domain লিখুন:
   - `mukisoft.tech` → **Add**
   - তারপর আবার `www.mukisoft.tech` → **Add**
5. Vercel আপনাকে DNS records দেখাবে — সেগুলো পরের step-এ লাগবে।

#### Step 2: Registrar-এ DNS Records সেট করুন

আপনার registrar **Namify Domains Inc** (name.store থেকে কেনা)। তাদের control panel-এ login করুন এবং **DNS Management** section-এ যান।

**এই ৩টা record যোগ করুন (বা edit করুন):**

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | `Automatic` বা `3600` |
| `CNAME` | `www` | `cname.vercel-dns.com` | `Automatic` বা `3600` |

> 💡 **Name.store / Namify তে UI কেমন:** "DNS Records" বা "Name Servers" section খুঁজুন। `@` মানে root domain (মানে `mukisoft.tech` itself)। `www` মানে `www.mukisoft.tech`।

#### Step 3: যদি Cloudflare ব্যবহার করেন (Important!)

যদি আপনি domain-টা Cloudflare দিয়ে manage করেন (NS records Cloudflare-এ point করে), তাহলে Cloudflare dashboard-এ:

1. **DNS** → **Records** এ যান
2. `A` record `mukisoft.tech` → `76.76.21.21` add করুন
3. `CNAME` record `www` → `cname.vercel-dns.com` add করুন
4. **Proxy status: DNS only (grey cloud ☁️)** সিলেক্ট করুন — **Proxied (orange cloud 🟠) করবেন না!** Cloudflare proxy Vercel SSL-এর সাথে conflict করে।

#### Step 4: DNS Propagation Wait করুন

DNS records update হতে **৫ মিনিট থেকে ৪৮ ঘণ্টা** লাগতে পারে (সাধারণত ১৫-৩০ মিনিট)।

Verify করুন:

```bash
# macOS Terminal-এ:
dig mukisoft.tech +short
# আউটপুট হওয়া উচিত: 76.76.21.21

dig www.mukisoft.tech +short
# আউটপুট হওয়া উচিত: cname.vercel-dns.com এর পর যে IP আসে
```

অথবা browser-এ: https://dnschecker.org/#A/mukisoft.tech

#### Step 5: Vercel SSL Verify করুন

DNS propagation শেষ হলে Vercel dashboard-এ:

1. **Settings** → **Domains** এ ফিরে যান
2. `mukisoft.tech` এর পাশে **"Valid Configuration"** দেখাবে (হতে ১০-৩০ মিনিট লাগতে পারে)
3. SSL automatic issue হবে (~১ মিনিট)
4. ✅ হয়ে গেলে আপনার সাইট HTTPS-এ live!

#### Step 6: Test

Browser-এ যান: **https://mukisoft.tech/en/team**

এখন কাজ করবে। সাথে সাথে:
- https://mukisoft.tech → automatically /en redirect হবে
- https://www.mukisoft.tech → mukisoft.tech এ redirect হবে
- সব page reload (F5) কাজ করবে — 404 আসবে না

### 🆘 Troubleshooting

| সমস্যা | সমাধান |
|---|---|
| `dig +short` empty result | DNS records এখনো set হয়নি — registrar-এ ফিরে যান |
| `dig` shows wrong IP (Cloudflare IP) | Cloudflare proxy off করুন, DNS only mode-এ রাখুন |
| Vercel-এ "Invalid Configuration" | DNS propagation শেষ হয়নি — ১০-৩০ মিনিট wait করুন |
| "SSL certificate provisioning failed" | CAA record যোগ করুন: `0 issue "letsencrypt.org"` এবং `0 issuewild "letsencrypt.org"` |
| Browser "NET::ERR_CERT_AUTHORITY_INVALID" | HSTS cache clear করুন: Chrome-এ `chrome://net-internals/#hsts` → Delete domain |
| Domain redirects কিন্তু 404 দেখায় | পুরানো browser cache clear করুন, hard reload (Cmd+Shift+R) দিন |
| `www` কাজ করে কিন্তু root কাজ করে না | `A` record `@` সঠিকভাবে add হয়নি, registrar-এ check করুন |
| Root কাজ করে কিন্তু `www` কাজ করে না | `CNAME` record `www` missing, যোগ করুন |

### 🧹 Browser Cache Clear করার Quick Steps

DNS পরিবর্তনের পর পুরানো cache থাকতে পারে:

**Chrome:** `Cmd+Shift+Delete` → "Cached images and files" → Clear

**Safari:** Develop menu → Empty Caches (প্রথমে `Cmd+Option+I` দিয়ে enable করুন)

**Firefox:** `Cmd+Shift+Delete` → "Cache" → Clear Now

**Or hard reload:** `Cmd+Shift+R` (Mac) / `Ctrl+Shift+F5` (Windows)

### 🔬 Advanced: Cloudflare ব্যবহার করলে Bonus Settings

যদি আপনি Cloudflare DNS ব্যবহার করেন, তাহলে এই extra settings-গুলো করলে ভালো:

1. **SSL/TLS** → **Full (Strict)** সিলেক্ট করুন
2. **Speed** → **Rocket Loader** OFF করুন (Next.js এর সাথে conflict করে)
3. **Caching** → **Browser Cache TTL** → "Respect Existing Headers"
4. **Network** → **WebSockets** → ON করুন (admin panel Supabase real-time-এর জন্য)

### 💡 সবচেয়ে দ্রুত Test

সব DNS setup করার পর, browser-এ এই URL-গুলো try করুন:

```
https://mukisoft.tech/
https://mukisoft.tech/en
https://mukisoft.tech/en/team
https://www.mukisoft.tech/en/team
https://mukisoft.tech/bn
https://mukisoft.tech/bn/about
```

সবগুলোই কাজ করা উচিত — কোনো page-এ reload দিলেও 404 বা tunnel error আসবে না।

---

## 🚨 Part 9 — Domain Forwarding vs DNS Records (Critical!)

### আপনার সমস্যাটা হলো URL Forwarding!

আপনি domain কিনেছেন **name.store** থেকে (Namify Domains Inc)। তাদের অনেক user ভুল করে domain **"URL Forwarding"** setup করে দেন — কিন্তু সেটা কাজ করে না Vercel-এর সাথে। এটা diagnose করা যায় এভাবে:

```bash
dig www.mukisoft.tech +short @8.8.8.8
# আউটপুট: 216.198.79.1, 64.29.17.65   ← এই IP গুলো name.store এর parking/forwarding service এর
# সঠিক হওয়া উচিত: 76.76.21.21         ← Vercel এর IP
```

**216.198.79.1** IP টা name.store এর parking page — এটা HTTPS accept করে না তাই ERR_TUNNEL_CONNECTION_FAILED আসে।

### ✅ সঠিক সমাধান — name.store / Namify তে DNS Records সেট করুন

#### Step 1: name.store এ Login

1. https://name.store এ যান
2. আপনার account এ login করুন
3. **My Domains** → `mukisoft.tech` এ click করুন

#### Step 2: "URL Forwarding" বন্ধ করুন (যদি চালু থাকে)

**Settings** বা **Manage Domain** section এ খুঁজুন:
- **"URL Forwarding" / "Domain Forwarding" / "Web Forwarding"** — যদি enable থাকে তাহলে **DISABLE** করুন
- **"Email Forwarding"** — এটা চালু থাকলে DNS records interfere করতে পারে, সাময়িকভাবে বন্ধ রাখুন

URL Forwarding চালু থাকলে সেটাই আপনার সব traffic পার্কিং পেজে redirect করে দিচ্ছে।

#### Step 3: Nameservers চেক করুন

**Nameservers** section এ দেখুন — দুটো অবস্থা হতে পারে:

**Option A: Custom nameservers (Vercel DNS) — আপনার case:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
যদি এটা সেট করা থাকে, তাহলে আপনাকে **Vercel Dashboard এ** DNS records edit করতে হবে (Step 4B দেখুন)।

**Option B: Default name.store nameservers:**
```
ns1.name.store
ns2.name.store (বা similar)
```
যদি এটা থাকে, তাহলে আপনাকে **name.store এ** DNS records edit করতে হবে (Step 4A)।

**Recommendation:** Vercel DNS ব্যবহার করুন (Option A) — কারণ Vercel automatic SSL manage করে এবং CDN settings better।

#### Step 4A: name.store এ DNS Records সেট (যদি name.store NS ব্যবহার করেন)

**DNS Management** বা **Manage DNS** section এ যান। পুরানো records delete করে এই দুটো যোগ করুন:

| Type | Name | Value / Target | TTL |
|---|---|---|---|
| `A` | `@` (বা leave blank) | `76.76.21.21` | `3600` বা `Auto` |
| `CNAME` | `www` | `cname.vercel-dns.com` | `3600` বা `Auto` |

> 💡 **Important:** name.store interface এ `Name` বা `Host` field `@` হলে root domain (`mukisoft.tech`)। `www` হলে subdomain। কিছু registrar `Host` field এ root domain এর জন্য `@`, subdomain এর জন্য শুধু subdomain name চায়।

#### Step 4B: Vercel Dashboard এ DNS Records সেট (যদি Vercel NS ব্যবহার করেন — আপনার current setup)

1. https://vercel.com/dashboard → আপনার MukiSoft project
2. **Settings** → **Domains**
3. `mukisoft.tech` এর পাশে click করুন
4. **"DNS Records"** বা **"Edit"** section এ নিচের records verify/edit করুন:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

5. যদি `216.198.79.1` বা অন্য কোনো ভুল IP থাকে, সেটা **delete** করুন
6. সঠিক values দিয়ে save করুন

#### Step 5: Wait for DNS Propagation

DNS records update হতে **৫ মিনিট থেকে ৪৮ ঘণ্টা** লাগতে পারে। সাধারণত ১৫-৩০ মিনিট।

**Verify:**

```bash
# macOS/Linux terminal:
dig mukisoft.tech +short @8.8.8.8
# সঠিক আউটপুট: 76.76.21.21

dig www.mukisoft.tech +short @8.8.8.8
# সঠিক আউটপুট: 76.76.21.21 (CNAME flatten হয়ে A record হয়ে যায়)

# অথবা browser: https://dnschecker.org/#A/mukisoft.tech
```

#### Step 6: Vercel-এ Domain Configuration Verify

Vercel dashboard → Settings → Domains এ:

- `mukisoft.tech` এর পাশে **"Valid Configuration"** দেখাবে ✅
- SSL certificate automatically issue হবে (~১ মিনিট)
- সব ঠিক থাকলে `https://mukisoft.tech/en` browser-এ কাজ করবে

#### Step 7: Test

Browser-এ:
- `https://mukisoft.tech/` → should redirect to `/en` ✅
- `https://www.mukisoft.tech/about` → should redirect to `/en/about` ✅
- `https://mukisoft.tech/en/team` → should work directly ✅

### 🆘 সমস্যা থাকলে Quick Checks

**Check 1: আসলেই Vercel DNS ব্যবহার হচ্ছে?**
```bash
dig mukisoft.tech NS +short
# ns1.vercel-dns.com, ns2.vercel-dns.com দেখালে সঠিক
```

**Check 2: A record সঠিক আছে?**
```bash
dig mukisoft.tech A +short
# 76.76.21.21 দেখালে সঠিক
# 216.198.79.1 বা অন্য IP দেখালে ভুল
```

**Check 3: URL Forwarding বন্ধ আছে?**
- name.store → My Domains → mukisoft.tech → URL Forwarding: OFF

**Check 4: পুরানো cache clear**
```bash
# macOS:
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# বা browser এ:
# Chrome: Cmd+Shift+Delete → Cached files clear
# তারপর hard reload: Cmd+Shift+R
```

**Check 5: Cloudflare চালু আছে কিনা (যদি না জানেন)**
```bash
dig mukisoft.tech NS +short
# যদি ada.ns.cloudflare.com বা similar দেখায়, তাহলে Cloudflare ব্যবহার হচ্ছে
# Cloudflare এ: DNS → Records → Proxy status OFF (grey cloud) করুন
```

### 🎯 Summary — আপনাকে ঠিক এই ৩টা কাজ করতে হবে

1. **name.store এ URL Forwarding disable করুন**
2. **Vercel Dashboard → Domains → DNS Records:**
   - `A` `@` → `76.76.21.21` (ভুল IP থাকলে delete করে নতুন add)
   - `CNAME` `www` → `cname.vercel-dns.com`
3. **১০-৩০ মিনিট wait** করুন DNS propagation এর জন্য

তারপর `https://mukisoft.tech/about` সহ সব URL কাজ করবে — middleware automatically `/en/about` এ redirect করবে এবং সব page reload (F5) ও 404 ছাড়াই কাজ করবে।

---

## 📞 Need Help?

- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
- next-intl docs: https://next-intl-docs.vercel.app
- Supabase docs: https://supabase.com/docs

---

## ✅ TL;DR — সংক্ষেপে পুরো Process

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/user/mukisoft.git
git push -u origin main

# 2. Vercel Dashboard → New Project → Import from GitHub
# 3. Add env variables (Supabase keys)
# 4. Click Deploy
# 5. Done! Visit your URL 🎉

# Future updates:
git add . && git commit -m "Update" && git push
# (Vercel auto-redeploys)
```

---

**Last updated:** September 2026  
**For MukiSoft Technology** — built with Next.js 14, next-intl 3, Supabase, and ❤️ from Bangladesh.
