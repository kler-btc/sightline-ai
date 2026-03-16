/**
 * Status Bar Component
 * Shows connection status, camera status, and other system info
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Wifi, 
  WifiOff, 
  Camera, 
  CameraOff,
  Volume2,
  Mic,
  CheckCircle
} from 'lucide-react';

export function StatusBar() {
  const { 
    isConnected, 
    isCameraActive, 
    isSpeaking,
    mode 
  } = useApp();

  const modeLabels: Record<string, string> = {
    scene: 'Scene Description',
    reading: 'Text Reading',
    navigation: 'Navigation',
    objects: 'Object Detection',
    social: 'Social Recognition',
    currency: 'Currency ID'
  };

  return (
    <div className="status-bar" role="status" aria-live="polite">
      <div className="status-section">
        {/* Connection Status */}
        <div 
          className={`status-item ${isConnected ? 'active' : 'inactive'}`}
          aria-label={`WebSocket ${isConnected ? 'connected' : 'disconnected'}`}
        >
          {isConnected ? (
            <>
              <Wifi className="status-icon" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="status-icon" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Camera Status */}
        <div 
          className={`status-item ${isCameraActive ? 'active' : 'inactive'}`}
          aria-label={`Camera ${isCameraActive ? 'active' : 'inactive'}`}
        >
          {isCameraActive ? (
            <>
              <Camera className="status-icon" />
              <span>Camera On</span>
            </>
          ) : (
            <>
              <CameraOff className="status-icon" />
              <span>Camera Off</span>
            </>
          )}
        </div>

        {/* Speech Status */}
        {isSpeaking && (
          <div className="status-item speaking">
            <Volume2 className="status-icon pulse" />
            <span>Speaking</span>
          </div>
        )}
      </div>

      <div className="status-section">
        {/* Current Mode */}
        <div className="status-item mode">
          <CheckCircle className="status-icon" />
          <span>{modeLabels[mode] || 'Scene'}</span>
        </div>
      </div>
    </div>
  );
}
