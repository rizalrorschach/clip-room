# 🎯 ClipRoom

> **Real-time clipboard sharing across devices — instantly**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Status: Production Ready" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20Desktop-blue?style=for-the-badge" alt="Platform: Web, Mobile, Desktop" />
</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Installation](#️-installation)
- [⚙️ Configuration](#️-configuration)
- [📱 Usage](#-usage)
- [🏗️ Architecture](#️-architecture)
- [🔧 Development](#-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🔄 Real-time Synchronization
- **Instant sharing** across all devices in a room
- **Live updates** with Supabase real-time subscriptions
- **Cross-platform compatibility** (Web, Mobile, Desktop)

### 📝 Text Clipboard
- **Real-time text sharing** with debounced updates
- **Copy to clipboard** functionality
- **Clear and refresh** capabilities
- **Auto-sync** across devices

### 🖼️ Image Clipboard
- **Drag & drop** image upload
- **Paste from clipboard** (Ctrl+V) support
- **Image copy/download** with fallbacks
- **Supabase storage** integration
- **Real-time image sharing**

### 🎨 Modern UI/UX
- **Dark theme by default** with system preference support
- **Responsive design** for all devices
- **Smooth animations** and transitions
- **Accessible** with keyboard navigation
- **Mobile-optimized** interface

### 🔐 Security & Performance
- **Secure HTTPS** requirements for clipboard access
- **Automatic cleanup** of old rooms (24-hour expiration)
- **Error handling** and graceful degradation
- **Progressive enhancement** for older browsers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (free tier works great!)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/clip-room.git
cd clip-room
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database
Run this SQL in your Supabase SQL editor:

```sql
-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  text_content TEXT,
  image_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-images', 'room-images', true);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access
CREATE POLICY "Allow public access" ON rooms FOR ALL USING (true);
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application!

---

## 📱 Usage

### Creating a Room
1. **Visit the homepage** and click "Create Room"
2. **Share the room code** with your other devices
3. **Start sharing** text and images instantly!

### Joining a Room
1. **Click "Join Room"** on the homepage
2. **Enter the 6-character room code**
3. **Start collaborating** with others

### Text Sharing
- **Type or paste** text in the text area
- **Real-time updates** appear on all devices
- **Copy text** to your local clipboard
- **Clear content** when needed

### Image Sharing
- **Drag & drop** images onto the upload area
- **Press Ctrl+V** to paste images from clipboard
- **Click "Paste Image"** button for explicit pasting
- **Download images** or copy to clipboard
- **Clear images** when finished

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Real-time + Storage)
- **Deployment**: Vercel (recommended)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Reporting Bugs
1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with detailed description
3. **Include steps** to reproduce the bug
4. **Add browser/device** information

### 💡 Suggesting Features
1. **Open a feature request** issue
2. **Describe the use case** clearly
3. **Explain the benefits** to users
4. **Consider implementation** complexity

### 🔧 Code Contributions
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper commits
4. **Add tests** if applicable
5. **Update documentation** as needed
6. **Submit a pull request** with clear description

### 📋 Development Guidelines
- **Follow TypeScript** best practices
- **Use conventional commits** for commit messages
- **Write clean, readable code**
- **Add comments** for complex logic
- **Test on multiple devices** and browsers

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


<div align="center">
  <p>Made with ❤️ for seamless cross-device collaboration</p>
  <p>
    <a href="https://github.com/rizalrorschach/clip-room/stargazers">
      <img src="https://img.shields.io/github/stars/rizalrorschach/clip-room?style=social" alt="Stars" />
    </a>
    <a href="https://github.com/rizalrorschach/clip-room/forks">
      <img src="https://img.shields.io/github/forks/rizalrorschach/clip-room?style=social" alt="Forks" />
    </a>
    <a href="https://github.com/rizalrorschach/clip-room/issues">
      <img src="https://img.shields.io/github/issues/rizalrorschach/clip-room" alt="Issues" />
    </a>
  </p>
</div>
