/**
 * Control Panel Component
 * Main action buttons for the application
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  BookOpen, 
  Navigation, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Mic,
  MicOff
} from 'lucide-react';

export function ControlPanel() {
  const { 
    captureFrame, 
    sendFrame, 
    isProcessing, 
    isSpeaking,
    speak,
    stopSpeaking,
    mode,
    isCameraActive
  } = useApp();

  const [isListening, setIsListening] = useState(false);

  const handleDescribe = () => {
    const frame = captureFrame();
    if (frame) {
      sendFrame(frame);
    } else {
      speak('Camera is not active. Please start the camera first.');
    }
  };

  const handleReadText = async () => {
    const frame = captureFrame();
    if (!frame) {
      speak('Camera is not active. Please start the camera first.');
      return;
    }

    try {
      const response = await fetch('/api/read-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: frame })
      });

      const data = await response.json();
      if (data.success) {
        speak(data.text);
      } else {
        speak('Could not read text. Please try again.');
      }
    } catch (error) {
      console.error('Read text error:', error);
      speak('Error reading text. Please try again.');
    }
  };

  const handleNavigation = async () => {
    const frame = captureFrame();
    if (!frame) {
      speak('Camera is not active. Please start the camera first.');
      return;
    }

    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: frame })
      });

      const data = await response.json();
      if (data.success) {
        speak(data.guidance);
      } else {
        speak('Could not provide navigation. Please try again.');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      speak('Error getting navigation. Please try again.');
    }
  };

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Voice commands are not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      speak('Listening for command.');
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      speak(`You said: ${command}`);
      processVoiceCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      speak('Could not understand command. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (command: string) => {
    if (command.includes('describe') || command.includes('scene')) {
      handleDescribe();
    } else if (command.includes('read') || command.includes('text')) {
      handleReadText();
    } else if (command.includes('navigate') || command.includes('direction')) {
      handleNavigation();
    } else if (command.includes('stop') || command.includes('quiet')) {
      stopSpeaking();
    } else if (command.includes('help')) {
      speak('Available commands: describe scene, read text, navigate, stop speaking.');
    } else {
      speak('Unknown command. Say help for available commands.');
    }
  };

  return (
    <div className="control-panel">
      <h2 className="section-title">Quick Actions</h2>
      
      <div className="control-grid">
        {/* Describe Scene */}
        <Button
          onClick={handleDescribe}
          disabled={isProcessing || !isCameraActive}
          className="control-button primary"
          size="lg"
          aria-label="Describe current scene"
        >
          <Camera className="icon-medium" />
          <span>Describe Scene</span>
          <kbd className="key-hint">Space</kbd>
        </Button>

        {/* Read Text */}
        <Button
          onClick={handleReadText}
          disabled={isProcessing || !isCameraActive}
          variant="secondary"
          className="control-button"
          size="lg"
          aria-label="Read text from camera"
        >
          <BookOpen className="icon-medium" />
          <span>Read Text</span>
          <kbd className="key-hint">Enter</kbd>
        </Button>

        {/* Navigation */}
        <Button
          onClick={handleNavigation}
          disabled={isProcessing || !isCameraActive}
          variant="secondary"
          className="control-button"
          size="lg"
          aria-label="Get navigation guidance"
        >
          <Navigation className="icon-medium" />
          <span>Navigate</span>
        </Button>

        {/* Voice Command */}
        <Button
          onClick={handleVoiceCommand}
          disabled={isListening}
          variant={isListening ? 'destructive' : 'outline'}
          className="control-button"
          size="lg"
          aria-label={isListening ? 'Listening...' : 'Voice command'}
        >
          {isListening ? <MicOff className="icon-medium" /> : <Mic className="icon-medium" />}
          <span>{isListening ? 'Listening...' : 'Voice Command'}</span>
        </Button>

        {/* Stop Speech */}
        <Button
          onClick={stopSpeaking}
          disabled={!isSpeaking}
          variant="outline"
          className="control-button"
          size="lg"
          aria-label="Stop speaking"
        >
          {isSpeaking ? <Volume2 className="icon-medium" /> : <VolumeX className="icon-medium" />}
          <span>Stop Speech</span>
        </Button>

        {/* Repeat Last */}
        <Button
          onClick={() => speak('Last description repeated')}
          variant="outline"
          className="control-button"
          size="lg"
          aria-label="Repeat last description"
        >
          <RotateCcw className="icon-medium" />
          <span>Repeat</span>
        </Button>
      </div>

      {/* Voice command hint */}
      <div className="voice-hint">
        <p>Say: "describe scene", "read text", "navigate", or "stop"</p>
      </div>
    </div>
  );
}
