"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface DesignSandboxProps {
  htmlContent: string;
  cssContent: string;
  width?: string | number;
  height?: string | number;
  onRender?: () => void;
  className?: string;
  getIframeRef?: (iframe: HTMLIFrameElement) => void;
}

export interface DesignSandboxRef {
  updateContent: (html: string, css: string) => void;
  checkIfReady: () => Promise<boolean>;
}

const DesignSandbox = forwardRef<DesignSandboxRef, DesignSandboxProps>(({
  htmlContent,
  cssContent,
  width = '100%',
  height = '100%',
  onRender,
  className = '',
  getIframeRef,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [content, setContent] = useState('');

  // Create the content to be rendered in the iframe
  useEffect(() => {
    const iframeContent = `
      <!DOCTYPE html>
      <html style="height: 100%; margin: 0;">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta charset="utf-8">
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
            /* Create positioning boundary */
            .design-container {
              position: relative;
              overflow: hidden;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              transform: translateZ(0); /* Force GPU acceleration for better rendering */
              background: white; /* Ensure background is white for export */
              display: flex;
              justify-content: center;
              align-items: center;
              text-align: center;
              width: 100%;
              height: 100%;
            }
            /* Default styling for all design elements to ensure consistency */
            .design-container > * {
              margin: 0 auto;
            }
            ${cssContent}
          </style>
          <script>
            // Mark document as loaded when all resources are ready
            window.designIsReady = false;
            
            window.addEventListener('load', () => {
              // Small delay to ensure everything is rendered
              setTimeout(() => {
                window.designIsReady = true;
                
                // Apply containment rules
                const allElements = document.querySelectorAll('*');
                const bodyRect = document.body.getBoundingClientRect();
                
                allElements.forEach(el => {
                  const rect = el.getBoundingClientRect();
                  
                  // If element is outside viewport, bring it back in
                  if (rect.right > bodyRect.width || rect.bottom > bodyRect.height ||
                      rect.left < 0 || rect.top < 0) {
                    if (window.getComputedStyle(el).position === 'absolute') {
                      // Keep absolute positioned elements within bounds
                      el.style.maxWidth = '100%';
                      el.style.maxHeight = '100%';
                      
                      if (rect.left < 0) el.style.left = '0';
                      if (rect.top < 0) el.style.top = '0';
                      if (rect.right > bodyRect.width) el.style.right = '0';
                      if (rect.bottom > bodyRect.height) el.style.bottom = '0';
                    }
                  }
                });
              }, 50);
            });
            
            window.addEventListener('message', (event) => {
              // Add message handling for communication with parent frame
              if (event.data.type === 'update') {
                document.body.innerHTML = event.data.html;
                const styleEl = document.querySelector('style');
                if (styleEl) styleEl.textContent = event.data.css;
                window.designIsReady = false;
                
                // Mark as ready after a short delay to allow rendering
                setTimeout(() => {
                  window.designIsReady = true;
                }, 100);
              }
              
              // Check if design is ready for export
              if (event.data.type === 'checkReady') {
                window.parent.postMessage({ 
                  type: 'designReadyStatus', 
                  isReady: window.designIsReady 
                }, '*');
              }
            });
          </script>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
    
    setContent(iframeContent);
    
    // Wait a bit for the iframe to render the content
    const timer = setTimeout(() => {
      setIsLoaded(true);
      onRender?.();
    }, 200); // Increased timeout for better loading
    
    return () => clearTimeout(timer);
  }, [htmlContent, cssContent, onRender]);

  // Provide iframe reference to parent component for capturing as image
  useEffect(() => {
    if (iframeRef.current && getIframeRef) {
      getIframeRef(iframeRef.current);
    }
  }, [iframeRef, getIframeRef]);

  // Expose the updateContent method via ref
  useImperativeHandle(ref, () => ({
    updateContent: (html: string, css: string) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) return;
      
      // Send new content to iframe using postMessage
      iframeRef.current.contentWindow.postMessage({
        type: 'update',
        html,
        css
      }, '*');
    },
    
    // Add method to check if design is ready for export
    checkIfReady: () => {
      return new Promise<boolean>((resolve) => {
        if (!iframeRef.current || !iframeRef.current.contentWindow) {
          resolve(false);
          return;
        }
        
        // Set up listener for response
        const handleReadyResponse = (event: MessageEvent) => {
          if (event.data.type === 'designReadyStatus') {
            window.removeEventListener('message', handleReadyResponse);
            resolve(event.data.isReady);
          }
        };
        
        window.addEventListener('message', handleReadyResponse);
        
        // Ask iframe if it's ready
        iframeRef.current.contentWindow.postMessage({
          type: 'checkReady'
        }, '*');
        
        // Timeout after 500ms
        setTimeout(() => {
          window.removeEventListener('message', handleReadyResponse);
          resolve(true); // Assume ready after timeout
        }, 500);
      });
    }
  }));

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        srcDoc={content}
        onLoad={() => {
          setIsLoaded(true);
          onRender?.();
          
          // Ensure images are properly loaded for capture
          if (iframeRef.current?.contentDocument) {
            const iframeDoc = iframeRef.current.contentDocument;
            const images = iframeDoc.querySelectorAll('img');
            images.forEach(img => {
              img.crossOrigin = 'anonymous';
            });
          }
        }}
        title="Design Preview"
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
});

DesignSandbox.displayName = 'DesignSandbox';

export default DesignSandbox; 