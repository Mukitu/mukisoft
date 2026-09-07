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
