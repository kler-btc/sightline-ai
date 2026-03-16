/**
 * History Panel Component
 * Shows previous descriptions and allows replay
 */

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Volume2, 
  Trash2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export function HistoryPanel() {
  const { history, speak, clearHistory } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReplay = (text: string) => {
    speak(text);
  };

  const handleClear = () => {
    clearHistory();
    speak('History cleared');
  };

  // Show only last 3 items when collapsed
  const displayedHistory = isExpanded ? history : history.slice(0, 3);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="history-panel">
      <div 
        className="history-header"
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
          <History className="icon-small" />
          History
          <span className="history-count">({history.length})</span>
        </h2>
        <div className="history-actions">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            variant="ghost"
            size="sm"
            className="clear-button"
            aria-label="Clear history"
          >
            <Trash2 className="icon-small" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="expand-icon" />
          ) : (
            <ChevronDown className="expand-icon" />
          )}
        </div>
      </div>

      <ScrollArea className={`history-scroll ${isExpanded ? 'expanded' : ''}`}>
        <div className="history-list">
          {displayedHistory.map((item, index) => (
            <div 
              key={index} 
              className="history-item"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleReplay(item);
                }
              }}
            >
              <p className="history-text">{item}</p>
              <Button
                onClick={() => handleReplay(item)}
                variant="ghost"
                size="sm"
                className="replay-button"
                aria-label="Replay this description"
              >
                <Volume2 className="icon-small" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {!isExpanded && history.length > 3 && (
        <button 
          className="show-more"
          onClick={() => setIsExpanded(true)}
        >
          Show {history.length - 3} more...
        </button>
      )}
    </div>
  );
}
