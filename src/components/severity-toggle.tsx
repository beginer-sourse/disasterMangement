import React from 'react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface SeverityToggleProps {
  value: string;
  onValueChange: (value: string) => void;
}

const severityOptions = [
  { value: 'LOW', label: 'LOW', color: 'data-[state=on]:bg-green-500' },
  { value: 'MEDIUM', label: 'MEDIUM', color: 'data-[state=on]:bg-yellow-500' },
  { value: 'HIGH', label: 'HIGH', color: 'data-[state=on]:bg-red-500' },
  { value: 'CRITICAL', label: 'CRITICAL', color: 'data-[state=on]:bg-red-600' },
];

export function SeverityToggle({ value, onValueChange }: SeverityToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={onValueChange}
      variant="outline"
      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1"
    >
      {severityOptions.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={`${option.color} data-[state=on]:text-white`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
