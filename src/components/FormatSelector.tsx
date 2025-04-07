"use client";

import React from 'react';

export interface FormatOption {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
  icon?: string;
}

// Predefined format options for social media graphics
export const formatOptions: FormatOption[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    description: '1:1 square format (1080×1080px)',
    icon: '■',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    description: '9:16 vertical format (1080×1920px)',
    icon: '▮',
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    description: '1.91:1 landscape format (1200×630px)',
    icon: '▬',
  },
  {
    id: 'twitter-post',
    name: 'Twitter Post',
    width: 1600,
    height: 900,
    description: '16:9 landscape format (1600×900px)',
    icon: '▭',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    description: '1.91:1 landscape format (1200×627px)',
    icon: '▬',
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    width: 1000,
    height: 1500,
    description: '2:3 vertical format (1000×1500px)',
    icon: '▯',
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    description: '16:9 landscape format (1280×720px)',
    icon: '▭',
  },
  {
    id: 'poster-a4',
    name: 'Poster (A4)',
    width: 2480,
    height: 3508,
    description: 'A4 portrait format (210×297mm)',
    icon: '▯',
  },
  {
    id: 'custom',
    name: 'Custom Size',
    width: 1200,
    height: 1200,
    description: 'Define your own dimensions',
    icon: '✚',
  }
];

interface FormatSelectorProps {
  selectedFormat: FormatOption | null;
  onSelectFormat: (format: FormatOption) => void;
}

export default function FormatSelector({ selectedFormat, onSelectFormat }: FormatSelectorProps) {
  // Group formats by orientation for better organization
  const squareFormats = formatOptions.filter(f => Math.abs(f.width - f.height) < 100);
  const landscapeFormats = formatOptions.filter(f => f.width > f.height && Math.abs(f.width - f.height) >= 100);
  const portraitFormats = formatOptions.filter(f => f.height > f.width && Math.abs(f.width - f.height) >= 100);
  const customFormats = formatOptions.filter(f => f.id === 'custom');

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Select a Format
      </h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Square</h3>
        <div className="grid grid-cols-2 gap-2">
          {squareFormats.map(format => (
            <FormatButton 
              key={format.id}
              format={format}
              isSelected={selectedFormat?.id === format.id}
              onSelect={onSelectFormat}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Landscape</h3>
        <div className="grid grid-cols-2 gap-2">
          {landscapeFormats.map(format => (
            <FormatButton 
              key={format.id}
              format={format}
              isSelected={selectedFormat?.id === format.id}
              onSelect={onSelectFormat}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Portrait</h3>
        <div className="grid grid-cols-2 gap-2">
          {portraitFormats.map(format => (
            <FormatButton 
              key={format.id}
              format={format}
              isSelected={selectedFormat?.id === format.id}
              onSelect={onSelectFormat}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Custom</h3>
        <div className="grid grid-cols-2 gap-2">
          {customFormats.map(format => (
            <FormatButton 
              key={format.id}
              format={format}
              isSelected={selectedFormat?.id === format.id}
              onSelect={onSelectFormat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FormatButtonProps {
  format: FormatOption;
  isSelected: boolean;
  onSelect: (format: FormatOption) => void;
}

function FormatButton({ format, isSelected, onSelect }: FormatButtonProps) {
  return (
    <button
      className={`flex flex-col items-center p-3 rounded-lg transition-all transform ${
        isSelected 
          ? 'bg-blue-100 border-2 border-blue-500 dark:bg-blue-900 dark:border-blue-600 shadow-md scale-105' 
          : 'bg-gray-50 hover:bg-gray-100 hover:scale-[1.02] border border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600'
      }`}
      onClick={() => onSelect(format)}
    >
      <div className={`text-2xl mb-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>{format.icon}</div>
      <div className={`font-medium text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : ''}`}>{format.name}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{format.description}</div>
      {isSelected && (
        <div className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
          ✓ Selected
        </div>
      )}
    </button>
  );
} 