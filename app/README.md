# 👁️ SightLine - AI Vision Assistant for the Blind

A multimodal AI application that uses Google's Gemini Live API to provide real-time visual assistance for blind and visually impaired users.

![SightLine Banner](https://via.placeholder.com/1200x400/000000/00d4ff?text=SightLine+AI+Vision+Assistant)

## 🏆 Hackathon Project

**Category:** Live Agents  
**Technologies:** Google Gemini Live API, Google GenAI SDK, Google Cloud, WebSocket, React, Node.js

---

## ✨ Features

### 🔍 **Scene Description**
- Real-time audio narration of surroundings
- Object and person identification
- Distance and spatial relationship awareness
- Obstacle detection and warnings

### 📖 **Text Reading (OCR)**
- Instant text reading from any surface
- Handwriting recognition
- Currency and document identification
- Menu reading at restaurants

### 🧭 **Navigation Assistance**
- Indoor navigation with landmark recognition
- Outdoor GPS integration
- Public transit guidance
- Crosswalk detection

### 👥 **Social Recognition**
- Face recognition for known contacts
- Facial expression detection
- Clothing color identification
- Group composition awareness

### 💰 **Currency Identification**
- Identify bills and coins
- State denominations clearly
- Support for multiple currencies

### 🎙️ **Voice Interface**
- Natural voice commands
- Text-to-speech output
- Adjustable speech rate
- Multiple language support

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Google Cloud API Key ([Get one here](https://console.cloud.google.com/apis/credentials))

### Installation

1. **Clone or extract the project**
```bash
cd sightline-ai-vision-assistant
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Set up environment variables**
```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your API keys
```

Your `.env` file should look like:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
PORT=3000
NODE_ENV=development
```

5. **Start the development server**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 🏗️ Production Deployment

### Build the application

```bash
npm run build:full
```

### Start production server

```bash
npm start
```

The app will be available at http://localhost:3000

---

## 📁 Project Structure

```
sightline-ai-vision-assistant/
├── backend/
│   ├── server.js          # Main Express server
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── uploads/           # Temporary image uploads
├── src/
│   ├── components/        # React components
│   │   ├── CameraView.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── DescriptionPanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── StatusBar.tsx
│   │   └── VoiceCommands.tsx
│   ├── contexts/
│   │   └── AppContext.tsx # Global state management
│   ├── App.tsx            # Main app component
│   ├── App.css            # Styles
│   └── main.tsx           # Entry point
├── dist/                  # Built frontend files
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🎮 Usage Guide

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Describe current scene |
| `Enter` | Read text from camera |
| `Alt + 1-6` | Switch between modes |
| `Esc` | Stop speech |

### Voice Commands

Say any of these commands when voice recognition is active:

- **"Describe scene"** - Get a description of surroundings
- **"Read text"** - Read all visible text
- **"Navigate"** - Get navigation guidance
- **"Stop"** - Stop current speech
- **"Help"** - Hear available commands

### Modes

1. **Scene** - General scene description
2. **Read** - Text reading and OCR
3. **Navigate** - Navigation assistance
4. **Objects** - Object detection and location
5. **Social** - People and expression recognition
6. **Money** - Currency identification

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GOOGLE_CLOUD_API_KEY` | Yes | Google Cloud API key (for TTS) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

### Settings

- **Speech Rate**: Adjust how fast the AI speaks (50% - 200%)
- **Auto Describe**: Automatically describe scenes every X seconds
- **High Contrast**: Always enabled for accessibility

---

## 🌐 API Endpoints

### WebSocket (Real-time)

Connect to `ws://localhost:3000` for real-time video analysis.

Message types:
- `init` - Initialize session
- `frame` - Send video frame
- `command` - Send voice command

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze image with Gemini |
| `/api/read-text` | POST | OCR - Extract text from image |
| `/api/describe-objects` | POST | Detect objects in image |
| `/api/navigation` | POST | Get navigation guidance |
| `/api/tts` | POST | Text-to-speech |
| `/api/currency` | POST | Identify currency |
| `/api/face-recognition` | POST | Describe faces |
| `/api/health` | GET | Health check |

---

## 🔒 Privacy & Security

- All image processing is done server-side
- Images are not stored permanently (deleted after processing)
- Camera access is required only for active use
- No data is sent to third parties

---

## ♿ Accessibility

SightLine is designed with accessibility as the primary focus:

- ✅ High contrast color scheme
- ✅ Large, readable fonts
- ✅ Full keyboard navigation
- ✅ Screen reader compatible
- ✅ Voice command support
- ✅ Adjustable speech rate
- ✅ Reduced motion support

---

## 🛠️ Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Web APIs (Camera, Speech Synthesis, Speech Recognition)

### Backend
- Node.js
- Express
- WebSocket (ws)
- Google GenAI SDK
- Google Cloud APIs

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- Google Gemini Team for the amazing Live API
- Google Cloud for AI services
- shadcn/ui for the component library

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section below
2. Review the code comments
3. Consult Google Gemini API documentation

### Troubleshooting

**Camera not working**
- Ensure browser has camera permissions
- Try using HTTPS (required for camera in production)
- Check that no other app is using the camera

**WebSocket disconnected**
- Check that backend server is running
- Verify firewall settings
- Check browser console for errors

**Speech not working**
- Check system volume
- Try adjusting speech rate in settings
- Some browsers require user interaction before playing audio

---

**Built with ❤️ for the Google AI Hackathon**
