/**
 * SightLine App Context
 * Global state management for the application
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type AppMode = 'scene' | 'reading' | 'navigation' | 'objects' | 'social' | 'currency';

interface AppState {
  // Mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  // Camera
  isCameraActive: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  
  // WebSocket
  ws: WebSocket | null;
  isConnected: boolean;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  sendFrame: (imageData: string) => void;
  
  // Audio
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  
  // Results
  lastDescription: string;
  setLastDescription: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  
  // Settings
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  autoDescribe: boolean;
  setAutoDescribe: (value: boolean) => void;
  describeInterval: number;
  setDescribeInterval: (seconds: number) => void;
  
  // History
  history: string[];
  addToHistory: (text: string) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Mode state
  const [mode, setModeState] = useState<AppMode>('scene');
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // WebSocket state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Results state
  const [lastDescription, setLastDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings state
  const [speechRate, setSpeechRate] = useState(1);
  const [autoDescribe, setAutoDescribe] = useState(false);
  const [describeInterval, setDescribeInterval] = useState(5);
  const autoDescribeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // History state
  const [history, setHistory] = useState<string[]>([]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    return () => {
      stopCamera();
      disconnectWebSocket();
      stopSpeaking();
    };
  }, []);

  // Auto-describe effect
  useEffect(() => {
    if (autoDescribe && isCameraActive && isConnected) {
      autoDescribeIntervalRef.current = setInterval(() => {
        const frame = captureFrame();
        if (frame && wsRef.current?.readyState === WebSocket.OPEN) {
          sendFrame(frame);
        }
      }, describeInterval * 1000);
    } else {
      if (autoDescribeIntervalRef.current) {
        clearInterval(autoDescribeIntervalRef.current);
      }
    }
    
    return () => {
      if (autoDescribeIntervalRef.current) {
        clearInterval(autoDescribeIntervalRef.current);
      }
    };
  }, [autoDescribe, describeInterval, isCameraActive, isConnected]);

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      return null;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isCameraActive]);

  // WebSocket functions
  const connectWebSocket = useCallback(() => {
    const wsUrl = `ws://${window.location.host}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Initialize session
      websocket.send(JSON.stringify({
        type: 'init',
        mode,
        sessionId: Date.now().toString()
      }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'description' || data.type === 'response') {
        setLastDescription(data.text);
        addToHistory(data.text);
        speak(data.text);
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.message);
        speak('Sorry, I encountered an error. Please try again.');
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    wsRef.current = websocket;
    setWs(websocket);
  }, [mode]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWs(null);
      setIsConnected(false);
    }
  }, []);

  const sendFrame = useCallback((imageData: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsProcessing(true);
      wsRef.current.send(JSON.stringify({
        type: 'frame',
        image: imageData
      }));
    }
  }, []);

  // Speech functions
  const speak = useCallback(async (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    // Stop any current speech
    stopSpeaking();
    
    // Try server-side TTS first
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed: speechRate })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);
          audio.play();
          return;
        }
      }
    } catch (error) {
      console.log('Server TTS failed, using browser TTS');
    }
    
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a good voice
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) ||
                          voices.find(v => v.name.includes('Samantha')) ||
                          voices.find(v => v.lang === 'en-US');
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    currentUtteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  }, [speechRate]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Set mode with reconnection
  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    
    // Reconnect WebSocket with new mode
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'init',
        mode: newMode,
        sessionId: Date.now().toString()
      }));
    }
  }, [isConnected]);

  // History functions
  const addToHistory = useCallback((text: string) => {
    setHistory(prev => [text, ...prev].slice(0, 50));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value: AppState = {
    mode,
    setMode,
    isCameraActive,
    startCamera,
    stopCamera,
    captureFrame,
    videoRef,
    canvasRef,
    ws,
    isConnected,
    connectWebSocket,
    disconnectWebSocket,
    sendFrame,
    isSpeaking,
    speak,
    stopSpeaking,
    lastDescription,
    setLastDescription,
    isProcessing,
    setIsProcessing,
    speechRate,
    setSpeechRate,
    autoDescribe,
    setAutoDescribe,
    describeInterval,
    setDescribeInterval,
    history,
    addToHistory,
    clearHistory
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
