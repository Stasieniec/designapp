"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface DesignSandboxProps {
  htmlContent: string;
  cssContent: string;
  width?: string | number;
  height?: string | number;
  onRender?: () => void;
  className?: string;
}

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
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              max-width: 100%;
              max-height: 100%;
            }
            * {
              box-sizing: border-box;
              max-width: 100%;
            }
            /* Enforce proper sizing for all elements */
            img, svg, video, canvas, iframe {
              max-width: 100%;
              height: auto;
            }
            /* Ensure content stays within bounds */
            div, section, article, aside, header, footer, nav, main {
              max-width: 100%;
              overflow: hidden;
            }
            ${cssContent}
          </style>
          <script>
            window.addEventListener('message', (event) => {
              // Add message handling for communication with parent frame
              if (event.data.type === 'update') {
                document.body.innerHTML = event.data.html;
                const styleEl = document.querySelector('style');
                if (styleEl) styleEl.textContent = event.data.css;
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
    }, 100);
    
    return () => clearTimeout(timer);
  }, [htmlContent, cssContent, onRender]);

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
    }
  }));

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts"
        srcDoc={content}
        onLoad={() => {
          setIsLoaded(true);
          onRender?.();
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