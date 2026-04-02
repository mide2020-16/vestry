# 🎟️ Vestry Event Registration Platform

**A premium, fully-featured event registration and management system built with Next.js.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Features](#-features) • [Previews](#-previews) • [Tech Stack](#-tech-stack) • [Installation & Setup](#-installation-&-setup) • [Environment Variables](#-environment-variables)

---

## 📸 Previews

> **Note for Editor:** Add your video and images inside the placeholders below! To embed a video or image, drop the files into the `public` folder or host them, and update the paths.

### 🎥 Live Demo / Walkthrough Video

[![Watch the video](https://via.placeholder.com/800x450.png?text=Click+to+Watch+Demo+Video)](https://your-video-link.com)

_Watch the full end-to-end registration and checkout flow._

### 🖼️ Screenshots

| User Checkout Flow                                                       | Admin Dashboard Overview                                                         | Admin Settings & Config                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ![Checkout UI](https://via.placeholder.com/400x300.png?text=Checkout+UI) | ![Admin Dashboard](https://via.placeholder.com/400x300.png?text=Admin+Dashboard) | ![Admin Settings](https://via.placeholder.com/400x300.png?text=Admin+Settings) |

---

## 🚀 Features

- **Inventory Tracking:** Instantly see quantities of shirts, sizes, colors, and specific customer inscriptions for every merchandise order.
- **Dynamic Payment Toggles:** Enable or disable Paystack or Bank Transfer options on the fly from the admin panel to manage payment gateway preferences.
- **Receipt Verification:** One-click approval functionality to verify manual bank transfers.
- **Dynamic System Settings:** Change event prices, registration deadlines, available merch sizes/colors, and global bank details from a single dashboard.
- **Data Export:** Generate master registry PDF/CSV lists of all paid attendees including their merchandise variants.
- **Mobile-Responsive App Bar:** Manage your event seamlessly on the go via a native-feeling Bottom Tab Bar.

---

## 💻 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) via Mongoose
- **Payments:** [Paystack Inline JS](https://paystack.com/)
- **File Uploads:** [UploadThing](https://uploadthing.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🛠️ Installation & Setup

Want to run this project locally? Follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your_username/vestry.git
   cd vestry
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and populate it with the variables listed below.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in your browser.

---

## 🌍 Environment Variables

Create a `.env.local` file in the root of your project:

```env
# MongoDB Connection String
MONGODB_URI='mongodb+srv://<user>:<password>@cluster.mongodb.net/vestry?appName=Cluster0'

# Admin Roles & Permissions
ALLOWED_ADMIN_EMAILS='admin@example.com,manager@example.com'

# Email (SMTP) Configuration for Notifications
ADMIN_EMAIL='your-email@gmail.com'
ADMIN_PASS='your-app-specific-password'
ADMIN_RECEIVER_EMAIL='notifications-receiver@example.com'
SMTP_USER='your-email@gmail.com'
SMTP_PASS='your-app-specific-password'

# Paystack API Keys (Managed in Admin UI too)
PAYSTACK_PUBLIC_KEY='pk_test_xxxxxxxx'
PAYSTACK_SECRET_KEY='sk_test_xxxxxxxx'

# NextAuth / Next.js Configuration
AUTH_SECRET='your_generated_auth_secret'
NEXTAUTH_URL='http://localhost:3000'

# Google OAuth (For Admin Login)
GOOGLE_CLIENT_ID='xxxxxxxx.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET='GOCSPX-xxxxxxxx'

# Push Notifications (Web Push)
VAPID_PUBLIC_KEY='BC_xxxxxxxx'
VAPID_PRIVATE_KEY='xxxxxxxx'

# File Uploads (Manual Transfer Receipts)
UPLOADTHING_TOKEN='your_uploadthing_v7_token'
```

> **Pro Tip:** All payment prices and bank transfer account details are managed dynamically via the Admin Settings UI, not environment variables!

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the MIT License.

**Built with ❤️ for incredible events!**
