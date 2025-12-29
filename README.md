# <div align="center">Akhi AI</div>

<div align="center">

<strong>Your Islamic Knowledge Companion</strong>

</div>

<br />

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Akhi AI](https://img.shields.io/badge/Akhi-AI-C9A961?style=for-the-badge&logo=book&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**[🚀 Launch Application](https://akhi.theoneatom.com)** | **[📖 Features](#-core-features)**

</div>

<br />

> **"Seek knowledge from the cradle to the grave."**

> **Akhi AI** (Arabic: أخي, meaning "My Brother") is your dedicated companion for authentic Islamic knowledge. Built with precision and reverence, it provides accurate, sourced answers from the Quran, Sunnah, and recognized scholarly traditions, presented in a serene and distraction-free interface.

---

## 🌟 Mission

In an age of information overload, finding verified Islamic answers can be difficult. **Akhi AI** serves as a bridge to authentic knowledge, prioritizing:

-   **Authenticity**: Zero tolerance for unverified information.
-   **Transparency**: Every answer is backed by clear references to primary sources.
-   **Inclusivity**: Respectful handling of differing valid scholarly opinions (Madhhabs).
-   **Adab (Etiquette)**: A user experience designed with the dignity of the content in mind.

---

## ✨ Core Features

### 📚 Authentic Knowledge Engine
Powered by advanced artificial intelligence tuned for Islamic sciences, providing answers deeply rooted in:
-   **The Holy Quran** (with Tafsir context)
-   **Hadith Collections** (Al-Kutub Al-Sittah)
-   **Fiqh Encyclopedias**

### 🕌 Madhhab-Aware Fiqh
Tailor your learning experience by verifying rulings across the four major schools of thought:
-   **Hanafi**
-   **Shafi'i**
-   **Maliki**
-   **Hanbali**
*Or select "General" for a comparative overview.*

### 🕋 Qibla Finder & Prayer Times
-   **AR Mode**: Point your camera and find Qibla in real-time
-   **Compass Mode**: Classic 2D compass with True North correction
-   **Prayer Times**: Accurate local prayer times with multiple calculation methods

### 🔗 Verified Citation System
Unlike standard AI, Akhi AI enforces a strict citation policy. Every major claim is linked to its source, allowing you to verify verses and hadiths directly.

### 🎨 Premium Islamic Design
-   **Distraction-Free UI**: Engaging typewriter effects and smooth animations.
-   **Typography**: Legible, beautiful Arabic and English typefaces (Amiri, Cairo).
-   **Theme**: A color palette inspired by classical Islamic art (Gold, Deep Green, Parchment).

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18+)
-   **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/zakisheriff/Al-Ilm.git
    cd Al-Ilm
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Application**
    ```bash
    npm run dev
    ```

    Visit `http://localhost:3000` to begin your journey.

---

## 🔒 Privacy & Security

-   **Secure API**: All AI requests are proxied through server-side routes (API keys never exposed)
-   **Ephemeral**: No conversation history is stored on any server. Your questions remain yours.
-   **Transparent**: Open-source frontend code ensures full visibility into the application logic.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **AI Backend** | Multi-provider fallback (Groq → Gemini → Mistral → OpenRouter) |
| **Styling** | Pure CSS3, Glassmorphism Design System |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout + SEO metadata
│   ├── page.tsx         # Home page (chat interface)
│   ├── api/chat/        # Secure AI proxy endpoint
│   ├── about/           # About page
│   └── sitemap.ts       # Dynamic sitemap
├── components/          # React components
├── services/            # Client-side services
├── styles/              # CSS files
└── public/              # Static assets
```

---

## ⚠️ Disclaimer

**Akhi AI** is an educational tool. While rigorous measures are taken to ensure accuracy, Islamic knowledge is vast and nuanced. For specific personal rulings (Fatwa), please consult a qualified local scholar/Mufti.

---

<div align="center">

Made by **Zaki Sheriff**

*May this tool be a means of beneficial knowledge (Ilm Nafi) for the Ummah.*

</div>
