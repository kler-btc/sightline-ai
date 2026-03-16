/**
 * Camera View Component
 * Displays the camera feed with capture controls
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

export function CameraView() {
  const { 
    videoRef, 
    canvasRef, 
    isCameraActive, 
    startCamera, 
    stopCamera,
    captureFrame,
    sendFrame,
    isProcessing,
    speak
  } = useApp();

  const [hasError, setHasError] = useState(false);

  const handleStartCamera = async () => {
    try {
      setHasError(false);
      await startCamera();
    } catch (error) {
      console.error('Failed to start camera:', error);
      setHasError(true);
      speak('Could not access camera. Please check permissions.');
    }
  };

  const handleCapture = () => {
    const frame = captureFrame();
    if (frame) {
      sendFrame(frame);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isCameraActive) {
        e.preventDefault();
        handleCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCameraActive]);

  return (
    <div className="camera-view">
      <div className="camera-container">
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Video feed */}
        {isCameraActive ? (
          <video
            ref={videoRef}
            className="camera-video"
            playsInline
            muted
            aria-label="Camera feed"
          />
        ) : (
          <div className="camera-placeholder">
            {hasError ? (
              <div className="error-state">
                <CameraOff className="icon-large" />
                <p>Camera access denied</p>
                <Button onClick={handleStartCamera} variant="outline">
                  <RefreshCw className="icon-small" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="inactive-state">
                <Camera className="icon-large" />
                <p>Camera is off</p>
                <Button onClick={handleStartCamera} size="lg">
                  <Camera className="icon-small" />
                  Start Camera
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="processing-overlay">
            <div className="spinner" />
            <span>Analyzing...</span>
          </div>
        )}

        {/* Camera controls overlay */}
        {isCameraActive && (
          <div className="camera-controls-overlay">
            <Button
              onClick={handleCapture}
              disabled={isProcessing}
              className="capture-button"
              size="lg"
              aria-label="Describe current scene"
            >
              {isProcessing ? <RefreshCw className="icon-spin" /> : <Camera />}
              <span>Describe Scene</span>
              <kbd className="key-hint">Space</kbd>
            </Button>
            
            <Button
              onClick={stopCamera}
              variant="destructive"
              size="sm"
              className="stop-camera-button"
              aria-label="Stop camera"
            >
              <CameraOff className="icon-small" />
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Camera status */}
      <div className="camera-status" aria-live="polite">
        <span className={`status-dot ${isCameraActive ? 'active' : 'inactive'}`} />
        <span>{isCameraActive ? 'Camera active' : 'Camera inactive'}</span>
      </div>
    </div>
  );
}
