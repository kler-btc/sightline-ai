/**
 * Settings Panel Component
 * Configure app preferences and accessibility options
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Volume2, 
  Clock, 
  Eye,
  Zap
} from 'lucide-react';

export function SettingsPanel() {
  const {
    speechRate,
    setSpeechRate,
    autoDescribe,
    setAutoDescribe,
    describeInterval,
    setDescribeInterval,
    speak
  } = useApp();

  const handleSpeechRateChange = (value: number[]) => {
    const newRate = value[0];
    setSpeechRate(newRate);
    speak(`Speech rate set to ${Math.round(newRate * 100)} percent`);
  };

  const handleAutoDescribeChange = (checked: boolean) => {
    setAutoDescribe(checked);
    speak(checked ? 'Auto describe enabled' : 'Auto describe disabled');
  };

  const handleIntervalChange = (value: number[]) => {
    const newInterval = value[0];
    setDescribeInterval(newInterval);
    speak(`Auto describe interval set to ${newInterval} seconds`);
  };

  return (
    <div className="settings-panel">
      <h2 className="section-title">
        <Settings className="icon-small" />
        Settings
      </h2>

      <div className="settings-grid">
        {/* Speech Rate */}
        <div className="setting-item">
          <div className="setting-header">
            <Volume2 className="icon-small" />
            <Label htmlFor="speech-rate" className="setting-label">
              Speech Rate
            </Label>
          </div>
          <div className="setting-control">
            <Slider
              id="speech-rate"
              min={0.5}
              max={2}
              step={0.1}
              value={[speechRate]}
              onValueChange={handleSpeechRateChange}
              className="setting-slider"
            />
            <span className="setting-value">{Math.round(speechRate * 100)}%</span>
          </div>
        </div>

        {/* Auto Describe */}
        <div className="setting-item">
          <div className="setting-header">
            <Zap className="icon-small" />
            <Label htmlFor="auto-describe" className="setting-label">
              Auto Describe
            </Label>
          </div>
          <div className="setting-control">
            <Switch
              id="auto-describe"
              checked={autoDescribe}
              onCheckedChange={handleAutoDescribeChange}
            />
          </div>
        </div>

        {/* Auto Describe Interval */}
        {autoDescribe && (
          <div className="setting-item indented">
            <div className="setting-header">
              <Clock className="icon-small" />
              <Label htmlFor="describe-interval" className="setting-label">
                Interval (seconds)
              </Label>
            </div>
            <div className="setting-control">
              <Slider
                id="describe-interval"
                min={3}
                max={30}
                step={1}
                value={[describeInterval]}
                onValueChange={handleIntervalChange}
                className="setting-slider"
              />
              <span className="setting-value">{describeInterval}s</span>
            </div>
          </div>
        )}

        {/* High Contrast Mode Info */}
        <div className="setting-item info">
          <div className="setting-header">
            <Eye className="icon-small" />
            <span className="setting-label">High Contrast</span>
          </div>
          <div className="setting-control">
            <span className="setting-hint">Enabled by default</span>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="shortcuts-info">
        <h3>Keyboard Shortcuts</h3>
        <ul className="shortcuts-list">
          <li><kbd>Space</kbd> Describe scene</li>
          <li><kbd>Enter</kbd> Read text</li>
          <li><kbd>Alt+1-6</kbd> Change mode</li>
          <li><kbd>Esc</kbd> Stop speech</li>
        </ul>
      </div>
    </div>
  );
}
