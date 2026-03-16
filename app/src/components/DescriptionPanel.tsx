/**
 * Description Panel Component
 * Displays the AI's descriptions and analysis results
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Volume2, 
  Copy, 
  Share2, 
  MessageSquare,
  Clock
} from 'lucide-react';

export function DescriptionPanel() {
  const { 
    lastDescription, 
    isProcessing, 
    speak, 
    isSpeaking 
  } = useApp();

  const handleCopy = () => {
    if (lastDescription) {
      navigator.clipboard.writeText(lastDescription);
      speak('Description copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (!lastDescription) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SightLine Description',
          text: lastDescription
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="description-panel">
      <h2 className="section-title">
        <MessageSquare className="icon-small" />
        Description
      </h2>

      <div className="description-container">
        {isProcessing ? (
          <div className="processing-state">
            <div className="spinner-large" />
            <p>Analyzing image...</p>
            <span className="processing-hint">This may take a few seconds</span>
          </div>
        ) : lastDescription ? (
          <ScrollArea className="description-scroll">
            <div className="description-content">
              <div className="description-header">
                <Clock className="icon-small" />
                <span className="timestamp">{formatTimestamp()}</span>
              </div>
              <p className="description-text">{lastDescription}</p>
            </div>
          </ScrollArea>
        ) : (
          <div className="empty-state">
            <MessageSquare className="icon-large" />
            <p>No description yet</p>
            <span className="empty-hint">
              Press Space or click "Describe Scene" to analyze the camera view
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {lastDescription && (
        <div className="description-actions">
          <Button
            onClick={() => speak(lastDescription)}
            disabled={isSpeaking}
            variant="outline"
            size="sm"
            className="action-button"
            aria-label="Read description aloud"
          >
            <Volume2 className="icon-small" />
            <span>Read Aloud</span>
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="action-button"
            aria-label="Copy description"
          >
            <Copy className="icon-small" />
            <span>Copy</span>
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="action-button"
            aria-label="Share description"
          >
            <Share2 className="icon-small" />
            <span>Share</span>
          </Button>
        </div>
      )}
    </div>
  );
}
