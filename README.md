# <div align="center">Al-Ilm AI</div>

<div align="center">

<strong>Authentic Islamic Knowledge Assistant Powered by AI</strong>

</div>

<br />

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**[🚀 View Live Demo](https://al-ilm-ai.vercel.app)** | **[📚 Documentation](#-documentation)** | **[⚡ Quick Start](#-quick-start)**

</div>

<br />

> **"Seek knowledge from the cradle to the grave."**

> Al-Ilm AI is your trusted companion for authentic Islamic knowledge.  
> Powered by Google's Gemini AI, it provides accurate answers with proper references from the Quran, Hadith, Fiqh, and recognized scholars.

---

## 🌟 Vision

Al-Ilm AI's mission is to provide:

- **Authentic Islamic Knowledge** — Answers backed by verified sources (Quran, Hadith, Fiqh)
- **Exact References** — Every answer includes proper citations (Surah:Verse, Hadith sources, scholar names)
- **School of Thought Selection** — Choose between Hanafi, Shafi'i, Maliki, Hanbali, or General (all opinions)
- **Elegant, Minimalist Design** — Islamic-inspired UI with beautiful typography

---

## ✨ Why Al-Ilm AI?

Finding authentic Islamic answers online can be challenging. Many sources lack proper references or scholarly verification.  

Al-Ilm AI bridges this gap by providing **AI-powered Islamic knowledge** with **complete source attribution**, ensuring you get accurate, well-referenced answers to your questions.

---

## 🎨 Design Philosophy

- **Islamic-Inspired Aesthetics**  
  Elegant gold and deep green color palette with Arabic/Islamic fonts (Amiri, Scheherazade New, Cairo)

- **Minimalist Elegance**  
  Clean, uncluttered interface focusing on clarity and readability

- **Mobile-First**  
  Fully responsive design that works seamlessly on all devices

- **Accessibility First**  
  High contrast, scalable fonts, keyboard navigation support

---

## 🤖 AI-Powered Intelligence

- **Google Gemini 2.5 Flash**  
  Advanced AI model optimized for accurate, context-aware responses

- **Comprehensive System Prompt**  
  Custom-engineered prompt ensures authentic Islamic knowledge with proper references

- **School of Thought Awareness**  
  Responses tailored to your selected school (Hanafi, Shafi'i, Maliki, Hanbali, or General)

- **Reference Requirements**  
  Every answer includes exact citations (Surah:Verse, Hadith sources, scholar names)

---

## 🔐 Privacy & Security

- **Client-Side Only**  
  All processing happens in your browser — your conversations stay private

- **No Data Collection**  
  We don't store or track your questions or conversations

- **API Key Security**  
  Your API key is stored locally and never shared

---

## 🎓 Features

### Core Features

✅ **Authentic Answers** — Verified Islamic knowledge from recognized sources  

✅ **Complete References** — Every answer includes proper citations  

✅ **School of Thought Selection** — Tailored responses based on your preference  

✅ **Real-time Chat Interface** — Interactive conversation experience  

✅ **Typing Indicators** — Smooth animations while AI is thinking  

✅ **Markdown-Free Responses** — Clean, readable text without formatting clutter  

✅ **Error Handling** — Graceful error messages and recovery  

✅ **Mobile Optimized** — Perfect experience on phones, tablets, and desktops  

---

## 📁 Project Structure

```
Al-Ilm-Cursor/
├── public/                      # Static assets
│   └── index.html
├── src/
│   ├── components/              # React components
│   │   ├── ChatContainer.jsx    # Main chat interface
│   │   ├── MessageBubble.jsx    # User/AI message display
│   │   ├── ChatInput.jsx        # Message input with send button
│   │   ├── TypingIndicator.jsx  # Loading animation
│   │   └── SchoolSelector.jsx   # School of thought dropdown
│   ├── services/
│   │   └── openaiService.js     # Gemini API integration
│   ├── utils/
│   │   └── systemPrompt.js      # System prompt builder
│   ├── styles/                  # Component-specific CSS
│   │   ├── App.css
│   │   ├── ChatContainer.css
│   │   ├── MessageBubble.css
│   │   ├── ChatInput.css
│   │   ├── TypingIndicator.css
│   │   └── SchoolSelector.css
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles & CSS variables
├── .env.local                   # Environment variables (not committed)
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/Al-Ilm.git
cd Al-Ilm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Google Gemini API key.

### 4. Run the Application

```bash
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 🎯 Usage

1. **Select School of Thought** (optional)  
   Use the dropdown in the header to select a specific school (Hanafi, Shafi'i, Maliki, Hanbali) or keep it as "General" to see all opinions.

2. **Ask Your Question**  
   Type your Islamic question in the input box and press Enter or click the send button.

3. **Receive Authentic Answer**  
   Al-Ilm AI will provide a comprehensive answer with:
   - Proper references (Quran verses, Hadith sources)
   - Scholar opinions (when applicable)
   - School of thought positions (when a specific school is selected)
   - Context and explanations

---

## 🔧 Tech Stack

### Frontend

- **React 18** — Modern UI framework with Hooks
- **Vite** — Lightning-fast build tool and dev server
- **Pure CSS** — No frameworks, custom Islamic-themed styling
- **Google Fonts** — Amiri, Scheherazade New, Cairo for beautiful typography

### AI Integration

- **Google Gemini API** — Advanced AI model for Islamic knowledge
- **Custom System Prompt** — Comprehensive prompt ensuring authenticity and references

---

## 🎨 Design System

### Colors

- **Gold**: `#C9A961` — Primary accent color
- **Deep Green**: `#013220` — AI messages and primary actions
- **Off-White**: `#FDF6E3` — Background color

### Typography

- **Primary Font**: Cairo (modern, readable)
- **Arabic Font**: Amiri (elegant Arabic script)
- **Base Size**: 15px (responsive scaling)

---

## 📊 How It Works

1. **User Input**  
   User types a question about Islam

2. **School Selection**  
   Selected school of thought is included in the system prompt

3. **AI Processing**  
   Gemini AI processes the question with comprehensive Islamic knowledge context

4. **Response Generation**  
   AI generates answer with required references and proper formatting

5. **Display**  
   Clean, formatted response displayed without markdown clutter

---

## 🔒 Security & Privacy

✅ **Client-Side Only** — All processing happens in your browser  

✅ **No Backend Required** — Direct API calls from browser  

✅ **No Data Storage** — Conversations are not stored or tracked  

✅ **Local API Key** — Your API key stays on your machine  

⚠️ **Note**: Since this is a client-side app, the API key will be visible in the browser. For production, consider using a backend proxy.

---

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variable**:
   - Go to project settings → Environment Variables
   - Add `VITE_GEMINI_API_KEY` with your API key
   - Redeploy

### Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Drag and drop the `dist` folder to Netlify
   - Or connect your Git repository

3. **Set Environment Variable**:
   - Site settings → Environment variables
   - Add `VITE_GEMINI_API_KEY`
   - Redeploy

---

## 📝 API Configuration

### Gemini Model

The app uses `gemini-2.5-flash` by default. To change the model, edit `src/services/openaiService.js`:

```javascript
model: 'gemini-2.5-flash', // Change to 'gemini-3-flash' or other available models
```

### System Prompt Customization

The system prompt can be customized in `src/utils/systemPrompt.js` to adjust:
- Response style
- Reference requirements
- School of thought handling

---

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — Free and Open Source

---

## ⚠️ Disclaimer

This application provides AI-generated responses for educational purposes. While efforts have been made to ensure accuracy and authenticity, users should verify important religious matters with qualified scholars and refer to authoritative sources.

---

## 🙏 Acknowledgments

- **Google** for providing the Gemini API
- **Google Fonts** for beautiful Arabic and Islamic fonts
- **The Islamic scholarly tradition** for the knowledge base
- **Open source community** for amazing tools and libraries

---

<div align="center">

Made by <strong>Zaki Sheriff</strong>

</div>

<div align="center">

<em>May this tool help Muslims around the world seek authentic Islamic knowledge.</em>

</div>

---

<p align="center">

**بارك الله فيك** (May Allah bless you)

</p>
