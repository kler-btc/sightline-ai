# 👁️ SightLine — Your AI Life Line

> **AI Vision Assistant for the Blind and Visually Impaired**  
> Built for the Google AI Hackathon · Live Agents Category

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-blue)](YOUR_REPLIT_URL_HERE)
[![Category](https://img.shields.io/badge/Category-Live%20Agents-purple)](.)
[![Powered By](https://img.shields.io/badge/Powered%20By-Gemini%20Live%20API-orange)](.)

-----

## 🌍 The Problem

2.2 billion people globally live with vision impairment. The tools available to them — white canes, basic screen readers, single-purpose apps — haven’t meaningfully evolved in decades.

Meanwhile, AI can see, describe, and understand the world in real time.

**SightLine closes that gap.**

-----

## ✨ What It Does

SightLine uses your smartphone camera as a real-time AI vision companion — describing your surroundings, reading text, guiding navigation, and recognizing faces, all through natural voice conversation.

|Mode          |What It Does                               |
|--------------|-------------------------------------------|
|🔍 **Scene**   |Real-time audio narration of surroundings  |
|📖 **Read**    |Instant OCR from any surface, menu, or sign|
|🧭 **Navigate**|Obstacle detection and spatial guidance    |
|📦 **Objects** |Identify and locate specific items         |
|👥 **Social**  |Describe people, expressions, clothing     |
|💰 **Currency**|Identify bills and coins by denomination   |

-----

## 🏗️ Architecture

```
📱 Camera + Voice Input
        ↓
⚛️  React Frontend (Vite + TypeScript + Tailwind)
        ↓  WebSocket + REST API
🟢 Node.js + Express Backend
        ↓
✨ Gemini Live API  ←→  Google Cloud Vision API
                              ↓
                    🔊 Cloud Text-to-Speech
                              ↓
                    👤 User Hears Description
```

**Target latency: < 2 seconds end-to-end**

-----

## 🛠️ Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite + Tailwind CSS
- shadcn/ui components
- Web Speech API + WebRTC

**Backend**

- Node.js + Express
- WebSocket (ws) for real-time streaming
- Google GenAI SDK (`@google/genai`)

**Google Cloud / AI**

- Gemini Live API — real-time multimodal processing
- Google Cloud Vision API — object/text detection
- Google Cloud Text-to-Speech — Neural2 voices
- Google Maps Platform — navigation
- Firebase — auth + real-time sync

-----

## 🚀 Run Locally

### Prerequisites

- Node.js 18+
- Gemini API key → [Get one here](https://aistudio.google.com)

### Setup

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# Run both frontend and backend
npm run dev
```

App runs at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

-----

## 🔑 Environment Variables

|Variable              |Required|Description                  |
|----------------------|--------|-----------------------------|
|`GEMINI_API_KEY`      |✅ Yes   |Google Gemini API key        |
|`GOOGLE_CLOUD_API_KEY`|Optional|For premium Cloud TTS voices |
|`PORT`                |Optional|Server port (default: 3000)  |
|`NODE_ENV`            |Optional|`development` or `production`|

-----

## 📡 API Endpoints

|Endpoint               |Method|Description                  |
|-----------------------|------|-----------------------------|
|`/api/analyze`         |POST  |Analyze scene with Gemini    |
|`/api/read-text`       |POST  |OCR — extract text from image|
|`/api/describe-objects`|POST  |Detect objects in image      |
|`/api/navigation`      |POST  |Get navigation guidance      |
|`/api/tts`             |POST  |Text-to-speech               |
|`/api/currency`        |POST  |Identify currency            |
|`/api/face-recognition`|POST  |Describe faces               |
|`/api/health`          |GET   |Health check                 |

-----

## ♿ Accessibility First

SightLine is designed with blind users as the **primary** users — not an afterthought.

- ✅ Full voice command support
- ✅ High contrast color scheme
- ✅ Large touch targets
- ✅ Complete keyboard navigation
- ✅ Screen reader compatible
- ✅ Adjustable speech rate
- ✅ No screen required to use core features

-----

## 🎯 Hackathon Requirements

- ✅ Uses **Gemini model** (Gemini Live API + multimodal vision)
- ✅ Built with **Google GenAI SDK** (`@google/genai`)
- ✅ Uses **Google Cloud services** (Vision API, TTS, Maps, Firebase)
- ✅ **Live Agents** category — real-time, interruptible conversation
- ✅ Goes beyond text-in/text-out — video + audio + voice

-----

## 📄 License

MIT — free to use, modify, and distribute.

-----

**Built with ❤️ for the Google AI Hackathon**  
*SightLine — See the world. Live your life.*
