/**
 * SightLine - AI Vision Assistant for the Blind
 * Main Application Component
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { CameraView } from './components/CameraView';
import { ModeSelector } from './components/ModeSelector';
import { ControlPanel } from './components/ControlPanel';
import { DescriptionPanel } from './components/DescriptionPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { StatusBar } from './components/StatusBar';
import { VoiceCommands } from './components/VoiceCommands';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function AppContent() {
  const { 
    isCameraActive, 
    startCamera, 
    connectWebSocket, 
    disconnectWebSocket,
    isConnected 
  } = useApp();

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        await startCamera();
        connectWebSocket();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    init();
    
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="sightline-app">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">👁️</span>
          <h1>SightLine</h1>
        </div>
        <p className="tagline">AI Vision Assistant for the Blind</p>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Left Panel - Camera & Controls */}
        <div className="left-panel">
          <CameraView />
          <ModeSelector />
          <ControlPanel />
        </div>

        {/* Right Panel - Description & Settings */}
        <div className="right-panel">
          <StatusBar />
          <DescriptionPanel />
          <VoiceCommands />
          <SettingsPanel />
          <HistoryPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Press <kbd>Space</kbd> to describe current scene • <kbd>Enter</kbd> to read text</p>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
