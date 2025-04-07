"use client";

import { Asset } from "@/components/AssetsSidebar";

// Key for storing assets in localStorage
const ASSETS_STORAGE_KEY = 'designapp_assets';

/**
 * Get all stored assets
 */
export const getAssets = (): Asset[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!storedAssets) return [];
    
    return JSON.parse(storedAssets);
  } catch (error) {
    console.error('Error loading assets:', error);
    return [];
  }
};

/**
 * Save an asset to storage
 */
export const saveAsset = async (file: File, customName?: string): Promise<Asset> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a URL for the file
      const url = URL.createObjectURL(file);
      
      // Get file extension
      const extension = file.name.split('.').pop() || '';
      
      // Use custom name if provided, otherwise use the original filename
      const displayName = customName 
        ? `${customName}.${extension}` 
        : file.name;
      
      // Create a temporary image element to get dimensions
      const img = new Image();
      img.onload = () => {
        // Create a new asset with dimensions
        const newAsset: Asset = {
          id: `asset_${Date.now()}`,
          name: displayName,
          url,
          type: 'image',
          uploadedAt: new Date(),
          width: img.width,
          height: img.height
        };
        
        // Get existing assets
        const currentAssets = getAssets();
        
        // Add the new asset
        const updatedAssets = [newAsset, ...currentAssets];
        
        // Save to localStorage
        localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(updatedAssets));
        
        // Resolve with the new asset
        resolve(newAsset);
      };
      
      img.onerror = () => {
        // If we can't load the image for some reason, still save it but without dimensions
        const newAsset: Asset = {
          id: `asset_${Date.now()}`,
          name: displayName,
          url,
          type: 'image',
          uploadedAt: new Date()
        };
        
        // Get existing assets
        const currentAssets = getAssets();
        
        // Add the new asset
        const updatedAssets = [newAsset, ...currentAssets];
        
        // Save to localStorage
        localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(updatedAssets));
        
        // Resolve with the new asset
        resolve(newAsset);
      };
      
      // Start loading the image to get dimensions
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete an asset by ID
 */
export const deleteAsset = (assetId: string): void => {
  try {
    // Get existing assets
    const currentAssets = getAssets();
    
    // Find the asset to delete
    const assetToDelete = currentAssets.find(asset => asset.id === assetId);
    
    // If found, revoke the object URL to prevent memory leaks
    if (assetToDelete) {
      URL.revokeObjectURL(assetToDelete.url);
    }
    
    // Filter out the asset to delete
    const updatedAssets = currentAssets.filter(asset => asset.id !== assetId);
    
    // Save to localStorage
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(updatedAssets));
  } catch (error) {
    console.error('Error deleting asset:', error);
  }
}; 