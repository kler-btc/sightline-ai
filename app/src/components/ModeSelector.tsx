/**
 * Mode Selector Component
 * Allows users to switch between different vision modes
 */

import React from 'react';
import { useApp, AppMode } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  BookOpen, 
  Navigation, 
  Box, 
  Users, 
  Banknote,
  Mic
} from 'lucide-react';

interface ModeOption {
  id: AppMode;
  label: string;
  description: string;
  icon: React.ElementType;
  shortcut?: string;
}

const modes: ModeOption[] = [
  {
    id: 'scene',
    label: 'Scene',
    description: 'Describe your surroundings',
    icon: Eye,
    shortcut: '1'
  },
  {
    id: 'reading',
    label: 'Read',
    description: 'Read text from documents, menus, signs',
    icon: BookOpen,
    shortcut: '2'
  },
  {
    id: 'navigation',
    label: 'Navigate',
    description: 'Get navigation guidance',
    icon: Navigation,
    shortcut: '3'
  },
  {
    id: 'objects',
    label: 'Objects',
    description: 'Identify objects and their locations',
    icon: Box,
    shortcut: '4'
  },
  {
    id: 'social',
    label: 'Social',
    description: 'Describe people and expressions',
    icon: Users,
    shortcut: '5'
  },
  {
    id: 'currency',
    label: 'Money',
    description: 'Identify currency and denominations',
    icon: Banknote,
    shortcut: '6'
  }
];

export function ModeSelector() {
  const { mode, setMode, speak } = useApp();

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    const modeInfo = modes.find(m => m.id === newMode);
    if (modeInfo) {
      speak(`Switched to ${modeInfo.label} mode. ${modeInfo.description}`);
    }
  };

  // Keyboard shortcuts for modes
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const modeIndex = parseInt(e.key) - 1;
        if (modeIndex >= 0 && modeIndex < modes.length) {
          e.preventDefault();
          handleModeChange(modes[modeIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mode-selector">
      <h2 className="section-title">
        <Mic className="icon-small" />
        Select Mode
      </h2>
      
      <div className="mode-grid" role="radiogroup" aria-label="Vision mode selection">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          
          return (
            <Button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              variant={isActive ? 'default' : 'outline'}
              className={`mode-button ${isActive ? 'active' : ''}`}
              role="radio"
              aria-checked={isActive}
              aria-label={`${m.label} mode: ${m.description}`}
            >
              <Icon className="mode-icon" />
              <div className="mode-info">
                <span className="mode-label">{m.label}</span>
                <span className="mode-description">{m.description}</span>
              </div>
              {m.shortcut && (
                <kbd className="mode-shortcut">Alt+{m.shortcut}</kbd>
              )}
            </Button>
          );
        })}
      </div>

      <div className="current-mode" aria-live="polite">
        <span className="mode-indicator">Current: {modes.find(m => m.id === mode)?.label}</span>
      </div>
    </div>
  );
}
