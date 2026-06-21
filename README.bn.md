<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="frontend/src/assets/logo-light.png">
    <img alt="Dakbox Logo" src="frontend/src/assets/logo-light.png" height="150">
  </picture>
</p>

<h1 align="center">Dakbox (ডাকবক্স)</h1>

<p align="center">
  <strong>JMAP প্রযুক্তিনির্ভর একটি আধুনিক, দ্রুতগামী এবং সেলফ-হোস্টেড ইমেইল সিস্টেম।</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js">
  <img src="https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF" alt="Vuetify">
  <img src="https://img.shields.io/badge/Stalwart-Mail_Server-orange?style=for-the-badge" alt="Stalwart Mail Server">
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## <img src="https://api.iconify.design/mdi/book-open-variant.svg" width="28" height="28" align="center"> প্রজেক্ট সম্পর্কে

**Dakbox** হলো একটি ওপেন-সোর্স, অত্যন্ত দ্রুত এবং প্রিমিয়াম ওয়েবমেইল ইন্টারফেস যা [Stalwart Mail Server](https://stalw.art/)-এর ওপর ভিত্তি করে তৈরি করা হয়েছে। এটি ধীরগতির IMAP প্রোটোকল ব্যবহার না করে আধুনিক **JMAP (JSON Meta Application Protocol)** ব্যবহার করে, যার ফলে ইমেইল সিঙ্ক হয় চোখের পলকে।

আপনি যদি Google Workspace বা Microsoft 365-এর মতো কোনো সার্ভিস খুঁজেন যা আপনার নিজের সার্ভারে কোনো মাসিক সাবস্ক্রিপশন ছাড়াই চলবে এবং যার ডিজাইন হবে অসাধারণ, তবে Dakbox আপনার জন্যই তৈরি!

## <img src="https://api.iconify.design/mdi/star-four-points.svg" width="28" height="28" align="center"> মূল ফিচারসমূহ

- <img src="https://api.iconify.design/mdi/lightning-bolt.svg" width="20" height="20" align="center"> **JMAP নির্ভর:** JMAP ব্যবহারের কারণে এটি অন্যান্য সাধারণ ইমেইল ক্লায়েন্টের তুলনায় কয়েকগুণ ফাস্ট।
- <img src="https://api.iconify.design/mdi/palette.svg" width="20" height="20" align="center"> **প্রিমিয়াম ডিজাইন:** Vue 3 এবং Vuetify দিয়ে তৈরি একটি "Glassmorphism" স্টাইলের দারুণ ইন্টারফেস।
- <img src="https://api.iconify.design/mdi/shield-check.svg" width="20" height="20" align="center"> **দুর্দান্ত সিকিউরিটি:** Stalwart-এর শক্তিশালী সিকিউরিটি, যেখানে DMARC, DKIM, SPF এবং Auto-TLS বিল্ট-ইন থাকে।
- <img src="https://api.iconify.design/mdi/feather.svg" width="20" height="20" align="center"> **লাইটওয়েট ফ্রন্টএন্ড:** কোনো ভারী Node.js বা PHP ব্যাকএন্ড নেই। পিওর স্ট্যাটিক ফ্রন্টএন্ড সরাসরি ইমেইল সার্ভারের সাথে কথা বলে।
- <img src="https://api.iconify.design/mdi/docker.svg" width="20" height="20" align="center"> **Docker-রেডি:** Docker Compose বা Coolify ব্যবহার করে মাত্র ৫ মিনিটে যেকোনো সার্ভারে ডেপ্লয় করা যায়।

## <img src="https://api.iconify.design/mdi/rocket-launch.svg" width="28" height="28" align="center"> লোকাল সেটআপ গাইড

### যা যা লাগবে (Prerequisites)
- Docker এবং Docker Compose
- Node.js 18+ (ফ্রন্টএন্ড ডেভেলপমেন্টের জন্য)

### ইন্সটলেশন

১. **রিপোজিটরি ক্লোন করুন:**
   ```bash
   git clone https://github.com/mrahatcreations/dakbox.git
   cd dakbox
   ```

২. **ইমেইল সার্ভার চালু করুন (Stalwart):**
   ```bash
   docker-compose up -d stalwart
   ```
   *এটি ব্যাকগ্রাউন্ডে ইমেইল সার্ভারের পোর্টগুলো (`25`, `143`, `465`, `587`, `993`) এবং অ্যাডমিন প্যানেল (`8080`) চালু করবে।*

৩. **ফ্রন্টএন্ড চালু করুন:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
৪. **লগিন করুন:**
   ব্রাউজারে `http://localhost:5174` ওপেন করুন। 
   *(প্রথমবার ব্যবহার করার সময় "Create Master Admin"-এ ক্লিক করে অ্যাডমিন প্যানেল থেকে ডোমেইন ও ইউজার তৈরি করে নিতে হবে)।*

## <img src="https://api.iconify.design/mdi/server-network.svg" width="28" height="28" align="center"> প্রোডাকশনে ডেপ্লয় করা (Coolify ও Cloudflare)

Dakbox যেহেতু সম্পূর্ণ ডকারাইজড, তাই এটিকে লাইভ সার্ভারে ডেপ্লয় করা খুবই সহজ। আমরা [Coolify](https://coolify.io/) ব্যবহারের পরামর্শ দিই। তবে আপনি যদি ডোমেইনের জন্য **Cloudflare** ব্যবহার করেন, তবে নিচের নিয়মটি অবশ্যই মানতে হবে।

### ধাপ ১: Cloudflare DNS সেটআপ (গুরুত্বপূর্ণ)
Cloudflare ইমেইল পোর্ট (যেমন 25) সাপোর্ট করে না। তাই Cloudflare-এ আপনার DNS রেকর্ডগুলো নিচের মতো সেট করতে হবে:

১. **A Records:**
   - Name: `mail` (ওয়েবমেইলের জন্য) -> Target: `আপনার_IP` -> Proxy: **DNS Only (Grey Cloud)** শুরুতে।
   - Name: `admin` (অ্যাডমিন প্যানেল) -> Target: `আপনার_IP` -> Proxy: **DNS Only (Grey Cloud)**।
   - Name: `mx` (ইমেইল রিসিভের জন্য) -> Target: `আপনার_IP` -> Proxy: **DNS Only (Grey Cloud) - এটি সবসময় Grey থাকতে হবে!**
২. **MX Record:**
   - Name: `@` -> Target: `mx.yourdomain.com` -> Priority: `10`
৩. **TXT Records (SPF, DKIM, DMARC):**
   - ডেপ্লয়মেন্ট শেষ হলে `admin.yourdomain.com`-এ লগিন করলে স্টলওয়ার্ট নিজে থেকেই এই রেকর্ডগুলো জেনারেট করে দেবে, আপনি শুধু কপি করে Cloudflare-এ বসিয়ে দেবেন।

### ধাপ ২: Coolify ডেপ্লয়মেন্ট
১. আপনার Coolify ড্যাশবোর্ডে এই রিপোজিটরিটি কানেক্ট করুন।
২. ডেপ্লয়মেন্ট মেথড হিসেবে **Docker Compose** সিলেক্ট করুন।
৩. Coolify প্যানেলে ডোমেইন সেটআপ করুন:
   - `frontend`-এর জন্য আপনার মূল ডোমেইন (যেমন: `mail.yourdomain.com`) দিন (Coolify অটোমেটিক ফ্রি SSL বসিয়ে দেবে)।
   - `stalwart`-এর (Port 8080) জন্য অ্যাডমিন ডোমেইন (যেমন: `admin.yourdomain.com`) দিন।
৪. Environment Variables-এ আপনার মাস্টার পাসওয়ার্ড দিন:
   ```env
   ADMIN_MAIL=admin@yourdomain.com
   ADMIN_PASSWORD=আপনার_কঠিন_পাসওয়ার্ড
   ```
   *সার্ভার চালু হওয়ার সাথে সাথে এই অ্যাকাউন্টটি অটোমেটিক তৈরি হয়ে যাবে।*
৫. **ডেপ্লয় করুন!** ইমেইলের জন্য প্রয়োজনীয় সব পোর্ট আপনার সার্ভারের সাথে অটোমেটিক কানেক্ট হয়ে যাবে।

> **সিকিউরিটি টিপস:** একবার অ্যাডমিন প্যানেলে লগিন করে মেইন অ্যাকাউন্ট তৈরি করা হয়ে গেলে, Environment Variables থেকে `ADMIN_MAIL` এবং `ADMIN_PASSWORD` মুছে ফেলাই ভালো।

## <img src="https://api.iconify.design/mdi/handshake.svg" width="28" height="28" align="center"> অবদান (Contributing)

প্রজেক্টটি আরও উন্নত করতে যেকোনো সাহায্য বা Pull Request সাদরে গৃহীত হবে!

## <img src="https://api.iconify.design/mdi/file-document-outline.svg" width="28" height="28" align="center"> লাইসেন্স

এই প্রজেক্টটি MIT লাইসেন্সের অধীনে উন্মুক্ত। বিস্তারিত জানতে [LICENSE](LICENSE) ফাইলটি পড়ুন।
