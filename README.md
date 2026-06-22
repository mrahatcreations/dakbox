<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="frontend/src/assets/logo-light.png">
    <img alt="Dakbox Logo" src="frontend/src/assets/logo-light.png" height="150">
  </picture>
</p>

<h1 align="center">Dakbox Frontend</h1>

<p align="center">
  <strong>A modern, blazing-fast, self-hosted webmail client built on JMAP.</strong>
</p>

---

## <img src="https://api.iconify.design/mdi/book-open-variant.svg" width="28" height="28" align="center"> Overview

**Dakbox** is an open-source, ultra-fast, and premium webmail interface designed to run alongside the [Stalwart Mail Server](https://stalw.art/). It drops the legacy baggage of IMAP and relies entirely on **JMAP (JSON Meta Application Protocol)** for instant synchronization and real-time responsiveness.

> **Note:** This repository contains **ONLY the Frontend Application** for Dakbox. The backend (Stalwart Mail Server) must be installed separately.

## <img src="https://api.iconify.design/mdi/server-network.svg" width="28" height="28" align="center"> Coolify Deployment Guide

The recommended way to deploy Dakbox and Stalwart is using [Coolify](https://coolify.io/). You will create **two separate resources** in Coolify: one Service for the Stalwart backend, and one Application for this Dakbox frontend.

### Step 1: Install Stalwart (Backend Service)

We need to install Stalwart as a completely independent Service so that its data is persistent and it can manage its own ports.

1. Go to your Coolify dashboard.
2. Navigate to **Services** -> **Add New Service**.
3. Select **Docker Compose** (Custom).
4. Paste the following Stalwart configuration:

```yaml
services:
  stalwart:
    image: stalwartlabs/stalwart:latest
    container_name: stalwart
    restart: always
    ports:
      - "25:25"     # SMTP
      - "143:143"   # IMAP
      - "465:465"   # SMTP TLS
      - "587:587"   # SMTP StartTLS
      - "993:993"   # IMAP TLS
    expose:
      - "8080"
    volumes:
      - stalwart-etc-v3:/opt/stalwart-mail/etc
      - stalwart-data-v3:/opt/stalwart-mail/data
      - stalwart-logs-v3:/opt/stalwart-mail/logs

volumes:
  stalwart-etc-v3:
  stalwart-data-v3:
  stalwart-logs-v3:
```

5. **CRITICAL:** Ensure the `container_name` remains exactly `stalwart`. The frontend relies on this exact name to communicate with the backend API.
6. **Save** the service.
7. In the Configuration page for the service, locate the **"Domains for stalwart"** field and enter your desired admin URL (e.g., `https://admin.saimum.org`).
8. Click **Deploy**.

### Step 2: Install Dakbox (Frontend Application)

Now we install this repository as a standard web application.

1. In Coolify, go to **Projects** -> Add a new resource -> **Application**.
2. Connect your GitHub account and select this repository.
3. Configure the domain for this frontend (e.g., `https://smail.saimum.org`).
4. Click **Deploy**.

## How They Connect

Coolify automatically places all resources on the same server into a shared internal Docker network (usually named `coolify`). Because we named the backend container `stalwart` in Step 1, the Nginx configuration inside this Frontend application securely routes all API requests (`/api/` and `/jmap/`) internally to `http://stalwart:8080`.
