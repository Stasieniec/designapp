"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image';
  uploadedAt: Date;
  width?: number;
  height?: number;
}

interface AssetsSidebarProps {
  assets: Asset[];
  onUpload: (file: File, customName?: string) => Promise<void>;
  onDelete: (assetId: string) => void;
}

export default function AssetsSidebar({ assets, onUpload, onDelete }: AssetsSidebarProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Only accept images
      if (!file.type.startsWith('image/')) {
        alert('Only image files are accepted.');
        return;
      }
      
      // Save the file and show the name input
      setSelectedFile(file);
      setCustomName(getFileNameWithoutExtension(file.name));
      setShowNameInput(true);
    }
  };
  
  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Save the file and show the name input
      setSelectedFile(file);
      setCustomName(getFileNameWithoutExtension(file.name));
      setShowNameInput(true);
    }
  };
  
  const getFileNameWithoutExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, ""); // Removes file extension
  };
  
  const handleFileUpload = async (file: File, name?: string) => {
    try {
      setUploading(true);
      await onUpload(file, name);
      // Reset state after upload
      setSelectedFile(null);
      setShowNameInput(false);
      setCustomName('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && customName.trim()) {
      await handleFileUpload(selectedFile, customName.trim());
    }
  };
  
  const cancelUpload = () => {
    setSelectedFile(null);
    setShowNameInput(false);
    setCustomName('');
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Assets</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload images to use in your design</p>
      </div>
      
      {/* Upload area */}
      {showNameInput ? (
        <div className="m-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name your image</h3>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full p-2 mb-3 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Enter image name"
              autoFocus
            />
            <div className="flex justify-between">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={cancelUpload}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                type="submit"
                disabled={uploading || !customName.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div 
          className={`m-4 p-4 border-2 border-dashed transition-colors rounded-lg flex flex-col items-center justify-center ${
            dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drag and drop an image</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">or</p>
          <Button 
            size="sm" 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}
      
      {/* Asset list */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Images</h3>
        {assets.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map(asset => (
              <div key={asset.id} className="group relative">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <img 
                    src={asset.url} 
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => onDelete(asset.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete ${asset.name}`}
                >
                  ×
                </button>
                <div className="flex flex-col mt-1">
                  <p className="text-xs truncate text-gray-800 dark:text-gray-200">{asset.name}</p>
                  {asset.width && asset.height && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{asset.width}×{asset.height}px</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 