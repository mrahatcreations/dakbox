<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="frontend/src/assets/logo-light.png">
    <img alt="Dakbox Logo" src="frontend/src/assets/logo-light.png" height="150">
  </picture>
</p>

<h1 align="center">Dakbox</h1>

<p align="center">
  <strong>A modern, blazing-fast, self-hosted webmail client built on JMAP.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js">
  <img src="https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF" alt="Vuetify">
  <img src="https://img.shields.io/badge/Stalwart-Mail_Server-orange?style=for-the-badge" alt="Stalwart Mail Server">
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## 📖 Overview

**Dakbox** is an open-source, ultra-fast, and premium webmail interface designed to run alongside the [Stalwart Mail Server](https://stalw.art/). It drops the legacy baggage of IMAP and relies entirely on **JMAP (JSON Meta Application Protocol)** for instant synchronization and real-time responsiveness.

If you are looking for a Google Workspace or Microsoft 365 alternative that you can host entirely on your own infrastructure with zero compromises on UI/UX, Dakbox is built for you.

## ✨ Key Features

- ⚡ **JMAP Native:** Built from the ground up to utilize JMAP for unparalleled speed and efficiency.
- 🎨 **Premium Aesthetic:** A "Glassmorphism" inspired, highly polished Vue 3 & Vuetify interface.
- 🛡️ **Enterprise Security:** Inherits Stalwart's robust security features including built-in DMARC, DKIM, SPF, and auto-TLS.
- 🪶 **Zero Backend Footprint:** Pure static frontend. No Node.js or PHP backends required. The UI communicates directly with the Stalwart core.
- 🐳 **Docker-Ready:** Deploy in minutes using Docker Compose or modern PaaS like Coolify.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrahatcreations/dakbox.git
   cd dakbox
   ```

2. **Spin up the Mail Server (Stalwart):**
   ```bash
   docker-compose up -d stalwart
   ```
   *Note: This starts the Stalwart core on ports `25`, `143`, `465`, `587`, `993`, and the Admin Panel on `8080`.*

3. **Run the Frontend UI:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Access the Application:**
   Open `http://localhost:5174` in your browser. 
   *(First-time setup: Click "Create Master Admin" to initialize your server via the Stalwart WebAdmin).*

## 🌍 Production Deployment (Coolify / VPS)

Deploying Dakbox to production is incredibly straightforward due to its containerized nature. We highly recommend using [Coolify](https://coolify.io/) or a similar Docker-native platform.

1. Connect this repository to your Coolify dashboard.
2. Select **Docker Compose** as your deployment target.
3. Configure your domains in the Coolify UI:
   - Map `frontend` to `mail.yourdomain.com` (Coolify provides automated Let's Encrypt SSL).
   - Map `stalwart` (Port 8080) to `admin.yourdomain.com`.
4. Add the following to your Environment Variables:
   ```env
   ADMIN_MAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_password
   ```
   *Stalwart will automatically provision this user on the first boot.*
5. **Deploy!** The necessary email ports (25, 465, 993, etc.) will bind automatically to your host network.
6. **DNS Configuration:** Ensure your domain's `A` record, `MX` records, and Reverse DNS (PTR) point to your server's IP address.

> **Security Note:** Once your master account is created and you have configured your domains via the Admin Panel, it is recommended to remove the `ADMIN_MAIL` and `ADMIN_PASSWORD` environment variables.

## 🤝 Contributing

We welcome contributions! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
