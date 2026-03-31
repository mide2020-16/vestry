<div align="center">

# 🎟️ Vestry Event Registration Platform

**A premium, fully-featured event registration and management system built with Next.js.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Features](#-features) • [Previews](#-previews) • [Tech Stack](#-tech-stack) • [Installation](#-installation-&-setup) • [Environment Variables](#-environment-variables)

</div>

---

## 📸 Previews

> **Note for Editor:** Add your video and images inside the placeholders below! To embed a video or image, drop the files into the `public` folder or host them, and update the paths.

### 🎥 Live Demo / Walkthrough Video

<div align="center">
  <a href="https://your-video-link.com" target="_blank">
    <img src="https://via.placeholder.com/800x450.png?text=Click+to+Watch+Demo+Video" alt="Watch the video" width="800" />
  </a>
  <p><i>Watch the full end-to-end registration and checkout flow.</i></p>
</div>

### 🖼️ Screenshots

| User Checkout Flow | Admin Dashboard Overview | Admin Settings & Config |
|:---:|:---:|:---:|
| <img src="https://via.placeholder.com/400x300.png?text=Checkout+UI" width="400"/> | <img src="https://via.placeholder.com/400x300.png?text=Admin+Dashboard" width="400"/> | <img src="https://via.placeholder.com/400x300.png?text=Admin+Settings" width="400"/> |

---

## 🚀 Features

Vestry is designed to handle complex event ticketing, merchandise add-ons, and dynamic pricing with absolute ease.

### 🧑‍💻 User Experience

- **Smart Registration:** Seamlessly purchase "Single" or "Couple" event tickets.
- **Customizable Merchandise:** Select merch (mesh) colors, sizes, and even write custom inscriptions! Choose exact mesh quantities independently of your ticket type.
- **Add-on Perks:** Browse and select event food and drink packages during checkout.
- **Beautiful UI:** A visually stunning, fully responsive interface powered by Tailwind CSS designed to wow users across Desktop and Mobile.
- **Dual Payment Options:**
  - **Paystack Checkout:** Fast online payments seamlessly calculating processing fees to ensure exact payouts.
  - **Manual Bank Transfer:** A smooth alternative allowing users to upload transaction receipts straight to the admin using UploadThing.

### 🛡️ Admin Superpowers

- **Analytics Dashboard:** Real-time metrics tracking total revenue, ticket distribution, and payment statuses.
- **Inventory Tracking:** Instantly see quantities of shirts, sizes, colors, and food item requirements.
- **Receipt Verification:** One-click approval functionality to verify manual bank transfers.
- **Dynamic System Settings:** Change event prices, registration deadlines, available merch sizes/colors, and global bank details on the fly.
- **Data Export:** Generate clean PDF/CSV rosters of all paid attendees.
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
   git clone https://github.com/yourusername/vestry.git
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
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vestry

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_string

# Paystack API Keys
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxx

# UploadThing API Keys
UPLOADTHING_SECRET=sk_live_xxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxxx
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

<div align="center">
  <b>Built with ❤️ for incredible events!</b>
</div>
