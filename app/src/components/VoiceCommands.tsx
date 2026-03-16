/**
 * Voice Commands Component
 * Shows available voice commands and quick tips
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageCircle
} from 'lucide-react';

interface VoiceCommand {
  command: string;
  description: string;
  example: string;
}

const voiceCommands: VoiceCommand[] = [
  {
    command: 'Describe scene',
    description: 'Get a description of your surroundings',
    example: 'Say "Describe scene" or "What do you see"'
  },
  {
    command: 'Read text',
    description: 'Read all visible text',
    example: 'Say "Read text" or "Read this"'
  },
  {
    command: 'Navigate',
    description: 'Get navigation guidance',
    example: 'Say "Navigate" or "Where am I"'
  },
  {
    command: 'Stop',
    description: 'Stop current speech',
    example: 'Say "Stop" or "Quiet"'
  },
  {
    command: 'Help',
    description: 'Hear available commands',
    example: 'Say "Help" or "What can I say"'
  }
];

export function VoiceCommands() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { speak } = useApp();

  const handleCommandClick = (cmd: VoiceCommand) => {
    speak(`${cmd.command}. ${cmd.description}`);
  };

  return (
    <div className="voice-commands">
      <div 
        className="voice-commands-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
      >
        <h2 className="section-title">
          <HelpCircle className="icon-small" />
          Voice Commands
        </h2>
        {isExpanded ? (
          <ChevronUp className="expand-icon" />
        ) : (
          <ChevronDown className="expand-icon" />
        )}
      </div>

      {isExpanded && (
        <div className="commands-list">
          <p className="commands-intro">
            Click a command to hear it, or say it aloud when voice recognition is active.
          </p>
          
          {voiceCommands.map((cmd, index) => (
            <Button
              key={index}
              onClick={() => handleCommandClick(cmd)}
              variant="ghost"
              className="command-item"
            >
              <Mic className="icon-small" />
              <div className="command-info">
                <span className="command-name">"{cmd.command}"</span>
                <span className="command-description">{cmd.description}</span>
              </div>
            </Button>
          ))}

          <div className="commands-tip">
            <MessageCircle className="icon-small" />
            <p>Tip: Press the microphone button and speak naturally</p>
          </div>
        </div>
      )}
    </div>
  );
}
