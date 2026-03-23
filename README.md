# Vestry ⛪

> A modern event registration platform built for church and religious gatherings.

![Status](https://img.shields.io/badge/status-beta-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## Overview

Vestry is a full-stack event registration platform designed specifically for church and religious gatherings. It streamlines the attendee experience from sign-up to event day — allowing members to register, select outfits and catering options, pay online, and receive a digital ticket, all in one place.

Admins get a dedicated dashboard to manage products, monitor registrations, and handle attendees — without needing to touch any code.

> ⚠️ **Note:** Vestry is currently in **beta** and intended for internal use. Expect occasional breaking changes as the platform matures.

---

## Features

### 🎽 Product Selection

Attendees can browse and select from curated mesh outfits, food, and drink options during the registration flow. Each product can be toggled available or hidden by admins in real time.

### 🧍 3D Outfit Preview

Before selecting an outfit, attendees can view an interactive 3D preview of the garment rendered directly in the browser using a `.glb` model — no app download required.

### 💳 Online Payments

Secure, integrated payment processing during registration. Supports variable pricing per product, with free inclusions clearly marked.

### 🎫 QR Code / Ticket Generation

Every registered attendee receives a unique digital ticket with a QR code upon successful registration and payment. Tickets can be scanned at the event for quick check-in.

### 👥 Attendee Management

Admins can view, search, and manage the full list of registered attendees from the dashboard, with real-time status updates.

### 🛠️ Admin Dashboard

A clean, dedicated admin interface for managing all aspects of the event — products, availability, attendees, and more — with no technical knowledge required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 3D Rendering | Three.js / `@react-three/fiber` |
| Icons | Lucide React |

---

## Screenshots / Demo

> 📸 Screenshots and a live demo link will be added as the project reaches a stable release.

In the meantime, here's what the core flows look like:

- **Registration flow** — attendees select outfits, food, and drinks, then pay and receive a ticket
- **3D preview** — interactive garment viewer embedded in the product selection step
- **Admin dashboard** — product management with category tabs, availability toggles, and a full attendee list

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB instance)
- A `.env.local` file with the required environment variables (see below)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/vestry.git
cd vestry

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in the values in .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root with the following keys:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vestry

# App
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Payments (add your payment provider keys)
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=
```

### Building for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
vestry/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # REST API endpoints
│   └── admin/            # Admin dashboard pages
├── components/
│   ├── admin/            # Admin-specific UI components
│   └── ui/               # Shared UI components
├── constants/            # Enums and shared constants (e.g. ProductCategory)
├── types/                # TypeScript type definitions
├── lib/                  # Database connection, utilities
└── public/               # Static assets and 3D models
```

---

## Contributing

Vestry is currently in beta and primarily for internal use, but contributions are welcome.

1. **Fork** the repository and create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and ensure everything builds:

   ```bash
   npm run build
   ```

3. **Commit** with a clear message:

   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **Open a Pull Request** against the `main` branch with a clear description of what you've changed and why.

### Guidelines

- Follow the existing code style (TypeScript, Tailwind, Next.js App Router conventions)
- Keep components small and focused
- Test your changes across mobile and desktop before submitting

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<p align="center">Built with ❤️ for the church community</p>
