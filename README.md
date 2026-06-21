# Dakbox: The Lightweight Open-Source Mail Server 🚀

Dakbox is an open-source, ultra-fast, and modern webmail interface built on top of **Stalwart Mail Server** and **Vue.js 3**. It is designed to be fully self-hosted, removing the complexity of maintaining bulky email stacks. 

If you want a premium, fast, and secure personal email server without paying monthly fees to Google or Microsoft, Dakbox is for you!

![Dakbox UI](https://via.placeholder.com/800x400?text=Dakbox+Webmail+UI)

## 🌟 Features
- **Incredibly Fast:** Uses JMAP (JSON Meta Application Protocol) instead of slow IMAP.
- **Modern UI:** Built with Vue.js, Vuetify, and a premium "Glass/Soft" aesthetic design.
- **Self-Hosted:** Deploy anywhere using Docker Compose.
- **Built-in Security:** Automatic TLS, DKIM, DMARC, and SPF management via Stalwart Admin Panel.
- **Lightweight:** No bulky backend. Just a static Vue frontend communicating directly with Stalwart.

## 📦 Prerequisites
- **Docker & Docker Compose** installed on your machine or VPS.
- A registered domain name (e.g., `dakbox.com`).

---

## 🛠️ Quick Setup (Local/Dev)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrahatcreative/dakbox.git
   cd dakbox
   ```

2. **Start the Mail Server:**
   ```bash
   docker-compose up -d stalwart
   ```
   *Note: This will expose ports 8080 (Admin), 25, 143, 465, 587, and 993.*

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5174` in your browser. Since you have no accounts yet, click on **"First time setting up? Create Master Admin"** to access the Admin Panel (http://localhost:8080/admin).

---

## 🚀 Production Deployment (Coolify / VPS)

Dakbox is ready for production and can easily be deployed using **Coolify** (or any Docker Compose environment).

1. Connect this GitHub repository to Coolify.
2. Select **Docker Compose** as the deployment method.
3. In Coolify, configure your domains:
   - For `frontend`: Set it to `mail.yourdomain.com` (Coolify will generate a free SSL certificate).
   - For `stalwart`: You can optionally proxy port `8080` to `admin.yourdomain.com`.
4. In Coolify's Environment Variables, set your master credentials:
   ```env
   ADMIN_MAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_super_secret_password
   ```
5. Deploy! Coolify will automatically bind the required email ports (25, 465, 993, etc.) to your host server.
6. **DNS Setup**: Go to your Domain Registrar (Cloudflare/Namecheap) and create an `A` record pointing to your server IP, and update your `MX` records. 

*Once you've logged in and created your primary account, you can remove the `ADMIN_MAIL` environment variable for enhanced security.*

## 🤝 Contributing
Feel free to open issues, submit pull requests, or suggest new features!

**License:** MIT
