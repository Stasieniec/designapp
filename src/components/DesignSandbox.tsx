"use client";

import React, { useRef, useEffect, forwardRef } from 'react';
import { Asset } from './AssetsSidebar';

interface DesignSandboxProps {
  htmlContent: string;
  cssContent: string;
  width?: string | number;
  height?: string | number;
  onRender?: () => void;
  className?: string;
  getIframeRef?: (iframe: HTMLIFrameElement) => void;
  assets?: Asset[];
}

// For backward compatibility with existing code
export interface DesignSandboxRef {
  updateContent: (html: string, css: string) => void;
}

const DesignSandbox = forwardRef<DesignSandboxRef, DesignSandboxProps>(({
  htmlContent,
  cssContent,
  width = '100%',
  height = '100%',
  onRender,
  className = '',
  getIframeRef,
  assets = []
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const doc = iframeRef.current.contentWindow.document;
      doc.open();
      
      // Create an asset map for quicker lookups
      const assetMap = assets.reduce((map, asset) => {
        map[asset.name] = asset.url;
        return map;
      }, {} as Record<string, string>);
      
      // Process HTML to replace image references with actual URLs
      let processedHtml = htmlContent;
      if (assets.length > 0) {
        // Log assets and replacement process for debugging
        console.log('Available assets:', assets);
        
        // Replace image src references that match asset names
        // This regex looks for <img src="assetName" and replaces with <img src="actualUrl"
        const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
        processedHtml = htmlContent.replace(imgRegex, (match: string, src: string) => {
          console.log('Found image src:', src);
          
          if (assetMap[src]) {
            console.log('Replacing with URL:', assetMap[src]);
            return match.replace(`src="${src}"`, `src="${assetMap[src]}"`).replace(`src='${src}'`, `src='${assetMap[src]}'`);
          }
          console.log('No matching asset found for:', src);
          return match;
        });
        
        console.log('Original HTML:', htmlContent);
        console.log('Processed HTML:', processedHtml);
      }
      
      // Extract width and height as numbers for exact dimensions
      const widthPx = typeof width === 'string' && width.endsWith('%') 
        ? '100%' 
        : `${parseInt(width.toString(), 10)}px`;
      
      const heightPx = typeof height === 'string' && height.endsWith('%') 
        ? '100%' 
        : `${parseInt(height.toString(), 10)}px`;
            
      // Create the content to be rendered in the iframe
      const iframeContent = `
        <!DOCTYPE html>
        <html style="height: 100%; margin: 0; padding: 0; overflow: hidden;">
          <head>
            <meta name="viewport" content="width=${widthPx},height=${heightPx},initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
            <meta charset="utf-8">
            <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                position: relative;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
              }
              * {
                box-sizing: border-box;
              }
              /* Constrain images and media */
              img, svg, video, canvas, iframe {
                max-width: 100%;
                height: auto;
              }
              
              /* Fixed size design container */
              #design-root {
                position: absolute;
                top: 0;
                left: 0;
                width: ${widthPx};
                height: ${heightPx};
                overflow: hidden;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
              }
              /* Create positioning boundary */
              .design-container {
                position: relative;
                overflow: hidden;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                transform: translateZ(0); /* Force GPU acceleration for better rendering */
                background: white; /* Ensure background is white for export */
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                width: 100%;
                height: 100%;
                padding: 0;
                margin: 0;
              }
              /* Default styling for all design elements to ensure consistency */
              .design-container > * {
                max-width: 100%;
                max-height: 100%;
                margin: 0 auto;
              }
              ${cssContent}
            </style>
            <script>
              // Notify parent when ready
              window.onload = function() {
                window.parent.postMessage('iframe-ready', '*');
              };
              
              // Handle updates from parent
              window.addEventListener('message', (event) => {
                if (event.data.type === 'update') {
                  const designRoot = document.getElementById('design-root');
                  if (designRoot) {
                    designRoot.innerHTML = event.data.html;
                  }
                  
                  const styleEl = document.querySelector('head > style:last-of-type');
                  if (styleEl) {
                    styleEl.textContent = event.data.css;
                  }
                  
                  // Ensure all images have crossOrigin attribute
                  document.querySelectorAll('img').forEach(img => {
                    img.crossOrigin = 'anonymous';
                  });
                }
              });
            </script>
          </head>
          <body>
            <div id="design-root">
              ${processedHtml}
            </div>
          </body>
        </html>
      `;
      
      doc.write(iframeContent);
      doc.close();

      // Ensure iframe content is properly loaded
      const handleLoad = () => {
        if (onRender) {
          onRender();
        }
        
        // Ensure images are properly loaded for capture
        if (iframeRef.current?.contentDocument) {
          const iframeDoc = iframeRef.current.contentDocument;
          const images = iframeDoc.querySelectorAll('img');
          images.forEach(img => {
            img.crossOrigin = 'anonymous';
          });
        }
      };

      iframeRef.current.onload = handleLoad;
    }
  }, [htmlContent, cssContent, width, height, onRender, assets]);

  // Provide iframe reference to parent component for capturing as image
  useEffect(() => {
    if (iframeRef.current && getIframeRef) {
      getIframeRef(iframeRef.current);
    }
  }, [iframeRef, getIframeRef]);

  // Expose the updateContent method via ref
  useEffect(() => {
    if (ref) {
      const updateContent = (html: string, css: string) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Process HTML to replace image references with actual URLs
          let processedHtml = html;
          if (assets.length > 0) {
            // Create an asset map for quicker lookups
            const assetMap = assets.reduce((map, asset) => {
              map[asset.name] = asset.url;
              return map;
            }, {} as Record<string, string>);
            
            console.log('Update content - Available assets:', assets);
            
            // Replace image references
            const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
            processedHtml = html.replace(imgRegex, (match: string, src: string) => {
              console.log('Update content - Found image src:', src);
              
              if (assetMap[src]) {
                console.log('Update content - Replacing with URL:', assetMap[src]);
                return match.replace(`src="${src}"`, `src="${assetMap[src]}"`).replace(`src='${src}'`, `src='${assetMap[src]}'`);
              }
              console.log('Update content - No matching asset found for:', src);
              return match;
            });
          }
          
          iframeRef.current.contentWindow.postMessage({
            type: 'update',
            html: processedHtml,
            css
          }, '*');
        }
      };

      // @ts-expect-error - This is using imperative handle which is typed differently
      ref.current = {
        updateContent
      };
    }
  }, [ref, assets]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title="Design Preview"
      />
    </div>
  );
});

DesignSandbox.displayName = 'DesignSandbox';

export default DesignSandbox; 