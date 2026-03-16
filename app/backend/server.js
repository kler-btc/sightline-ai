/**
 * SightLine Backend Server
 * AI Vision Assistant for the Blind
 * 
 * Features:
 * - Gemini Live API integration for real-time scene analysis
 * - WebSocket for streaming video frames
 * - REST API for various vision tasks
 * - Google Cloud Vision API integration
 * - Text-to-Speech generation
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==================== GEMINI LIVE API WEBSOCKET ====================

// Store active Gemini sessions
const geminiSessions = new Map();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  let geminiSession = null;
  let sessionId = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'init':
          // Initialize Gemini Live session
          sessionId = data.sessionId || Date.now().toString();
          geminiSession = await initializeGeminiSession(ws, data.mode || 'scene');
          geminiSessions.set(sessionId, geminiSession);
          ws.send(JSON.stringify({ 
            type: 'initialized', 
            sessionId,
            message: 'Gemini Live session started' 
          }));
          break;
          
        case 'frame':
          // Process video frame
          if (geminiSession) {
            await processFrame(geminiSession, data.image);
          }
          break;
          
        case 'audio':
          // Process audio input (for voice commands)
          if (geminiSession) {
            await processAudio(geminiSession, data.audio);
          }
          break;
          
        case 'command':
          // Handle voice command
          if (geminiSession) {
            await handleCommand(geminiSession, data.command, data.image);
          }
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
          
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: error.message 
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (sessionId && geminiSessions.has(sessionId)) {
      geminiSessions.delete(sessionId);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

async function initializeGeminiSession(ws, mode) {
  const systemPrompts = {
    scene: `You are SightLine, an AI vision assistant helping blind and visually impaired users understand their surroundings. 
    Describe what you see in clear, concise, helpful language. Focus on:
    - Important objects and their locations
    - People nearby and what they're doing
    - Potential obstacles or hazards
    - Text that might be important
    - General scene context
    Keep descriptions brief (2-3 sentences) but informative. Be empathetic and encouraging.`,
    
    navigation: `You are SightLine, a navigation assistant for blind users. 
    Provide clear directional guidance. Describe:
    - Path obstacles and how to avoid them
    - Distance to destinations
    - Landmarks for orientation
    - Crosswalk signals and street names
    Be precise with directions (e.g., "turn left in 10 feet").`,
    
    reading: `You are SightLine, a reading assistant for blind users.
    Read all text visible in the image clearly and completely.
    Organize information logically (headings, body text, etc.).
    Describe document type and layout.
    Highlight important information like prices, dates, warnings.`,
    
    social: `You are SightLine, helping blind users with social interactions.
    Describe:
    - Who is present and their approximate location
    - Facial expressions and body language
    - What people are doing
    - Group dynamics
    Be sensitive and respectful in descriptions.`
  };

  const model = genAI.models.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: systemPrompts[mode] || systemPrompts.scene,
  });

  const chat = model.startChat({
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });

  return { chat, ws, mode };
}

async function processFrame(session, imageBase64) {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const result = await session.chat.sendMessage([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      },
      { text: 'Describe what you see in this image.' }
    ]);

    const response = await result.response;
    const text = response.text();

    session.ws.send(JSON.stringify({
      type: 'description',
      text: text,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Frame processing error:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process image'
    }));
  }
}

async function handleCommand(session, command, imageBase64) {
  try {
    const base64Data = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : null;
    
    const parts = [];
    if (base64Data) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }
    parts.push({ text: command });

    const result = await session.chat.sendMessage(parts);
    const response = await result.response;
    const text = response.text();

    session.ws.send(JSON.stringify({
      type: 'response',
      text: text,
      command: command,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Command handling error:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process command'
    }));
  }
}

// ==================== REST API ENDPOINTS ====================

/**
 * @route POST /api/analyze
 * @desc Analyze an image with Gemini
 */
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { mode = 'scene', prompt } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.models.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const modePrompts = {
      scene: 'Describe this scene in detail for a blind person. Include objects, people, layout, and any potential hazards.',
      text: 'Read all text visible in this image. Include any important details like prices, dates, or warnings.',
      objects: 'List all objects visible in this image with their approximate locations.',
      navigation: 'Provide navigation guidance based on this image. Describe the path, obstacles, and directions.',
      social: 'Describe the people in this image, their expressions, and what they appear to be doing.'
    };

    const result = await model.generateContent([
      { text: prompt || modePrompts[mode] || modePrompts.scene },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      description: text,
      mode,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/read-text
 * @desc OCR - Extract all text from an image
 */
app.post('/api/read-text', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.models.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      { text: 'Read all text visible in this image. Preserve the layout and structure as much as possible. Include any important details.' },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      text: text,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/describe-objects
 * @desc Detect and describe objects in an image
 */
app.post('/api/describe-objects', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.models.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      { text: 'List all objects in this image with their approximate positions (left, right, center, near, far). Include people, furniture, doors, and any obstacles.' },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      objects: text,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Object detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/navigation
 * @desc Get navigation guidance
 */
app.post('/api/navigation', upload.single('image'), async (req, res) => {
  try {
    const { destination, currentLocation } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.models.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = destination 
      ? `Provide navigation guidance to reach "${destination}". Describe the path, obstacles, and directions clearly.`
      : 'Describe the current location and surroundings for navigation purposes. Include landmarks, street names if visible, and potential paths forward.';

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      guidance: text,
      destination,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Navigation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/tts
 * @desc Text-to-Speech
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US-Neural2-D', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Use Google Cloud Text-to-Speech API
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voice.split('-').slice(0, 2).join('-'),
            name: voice
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed
          }
        })
      }
    );

    const data = await response.json();

    if (data.audioContent) {
      res.json({
        success: true,
        audioContent: data.audioContent,
        timestamp: Date.now()
      });
    } else {
      throw new Error('TTS generation failed');
    }
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/currency
 * @desc Identify currency from image
 */
app.post('/api/currency', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.models.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      { text: 'Identify any currency (bills or coins) visible in this image. State the denomination and currency type clearly.' },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      currency: text,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Currency detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/face-recognition
 * @desc Describe faces and expressions
 */
app.post('/api/face-recognition', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.models.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      { text: 'Describe the people in this image. Include approximate age range, gender, facial expressions, and what they appear to be doing. Be respectful and objective.' },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      faces: text,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Face recognition error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎯 SightLine - AI Vision Assistant for the Blind         ║
║                                                            ║
║   Server running on port ${PORT}                            ║
║                                                            ║
║   Features:                                                ║
║   • Real-time scene description                            ║
║   • Text reading (OCR)                                     ║
║   • Navigation assistance                                  ║
║   • Object detection                                       ║
║   • Currency identification                                ║
║   • Face recognition                                       ║
║   • Text-to-Speech                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
