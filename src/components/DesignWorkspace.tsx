"use client";

import React, { useState, useRef } from 'react';
import DesignSandbox, { DesignSandboxRef } from './DesignSandbox';
import AIDesignAssistant from './AIDesignAssistant';
import Button from './Button';
import FormatSelector, { FormatOption } from './FormatSelector';

export default function DesignWorkspace() {
  // State to track which step of the process we're in
  const [step, setStep] = useState<'format-selection' | 'design'>('format-selection');
  
  // Selected format
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(null);
  
  // Design state
  const [designState, setDesignState] = useState({
    html: '<div class="empty-design"><p>Your design will appear here</p></div>',
    css: `.empty-design { 
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-family: sans-serif;
  color: #9CA3AF;
}`
  });
  
  const sandboxRef = useRef<DesignSandboxRef>(null);
  const [showCode, setShowCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css'>('html');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const handleSelectFormat = (format: FormatOption) => {
    setSelectedFormat(format);
  };
  
  const handleStartDesigning = () => {
    if (!selectedFormat) return;
    setStep('design');
    
    // Initialize with an empty container of the correct dimensions
    setDesignState({
      html: `<div class="design-container">
  <div class="placeholder-content">
    <div class="placeholder-text">AI Design Studio</div>
    <div class="placeholder-subtext">Tell the AI what you'd like to create</div>
  </div>
</div>`,
      css: `.design-container {
  width: 100%;
  height: 100%;
  background-color: white;
  position: relative;
  /* Design dimensions: ${selectedFormat.width}px × ${selectedFormat.height}px */
  aspect-ratio: ${selectedFormat.width} / ${selectedFormat.height};
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
}
.placeholder-content {
  text-align: center;
  color: #a0aec0;
  padding: 2rem;
}
.placeholder-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.placeholder-subtext {
  font-size: 1rem;
}
`
    });
  };
  
  const handleGenerateDesign = (html: string, css: string) => {
    setDesignState({ html, css });
  };
  
  const handleBackToFormatSelection = () => {
    setStep('format-selection');
  };
  
  const handleExport = () => {
    const { html, css } = designState;
    
    // Create a blob of the HTML with embedded CSS
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${selectedFormat?.name || 'AI Generated Design'}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFormat?.id || 'design'}-export.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCodeTabChange = (tab: 'html' | 'css') => {
    setActiveCodeTab(tab);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Design Studio</h1>
          <div className="flex space-x-3">
            {step === 'design' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBackToFormatSelection}
                >
                  Change Format
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? 'Hide Code' : 'Show Code'}
                </Button>
                <Button
                  onClick={handleExport}
                >
                  Export Design
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {step === 'format-selection' ? (
          <div className="h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full mb-16">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                Select a Format for Your Design
              </h2>
              <FormatSelector 
                selectedFormat={selectedFormat}
                onSelectFormat={handleSelectFormat}
              />
              
              <div className="mt-8 text-center pb-8">
                <Button 
                  onClick={handleStartDesigning}
                  disabled={!selectedFormat}
                  size="lg"
                  className={`py-3 px-8 text-lg ${selectedFormat ? 'animate-pulse bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {selectedFormat ? `Start Designing with ${selectedFormat.name}` : 'Start Designing'}
                </Button>
                {!selectedFormat && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please select a format to continue
                  </p>
                )}
                {selectedFormat && (
                  <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Click the button above to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col md:flex-row">
            {/* Design Sandbox */}
            <div className="flex-1 h-1/2 md:h-full">
              <div className="h-full flex flex-col">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 border-b flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedFormat?.name} ({selectedFormat?.width}×{selectedFormat?.height}px)
                  </span>
                </div>
                
                <div className="flex-1 overflow-hidden p-4 bg-gray-200 dark:bg-gray-900 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Zoom: {Math.round(zoomLevel * 100)}%
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setZoomLevel(prev => Math.max(0.25, prev - 0.1))}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label="Zoom out"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label="Reset zoom"
                      >
                        Reset
                      </button>
                      <button 
                        onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label="Zoom in"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto flex items-center justify-center">
                    <div 
                      className="relative overflow-hidden bg-white shadow-2xl" 
                      style={{
                        width: selectedFormat ? `${Math.min(selectedFormat.width, 600)}px` : '100%',
                        height: 'auto',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center',
                        transition: 'transform 0.2s',
                        aspectRatio: selectedFormat ? `${selectedFormat.width} / ${selectedFormat.height}` : '1 / 1'
                      }}
                    >
                      <DesignSandbox
                        ref={sandboxRef}
                        htmlContent={designState.html}
                        cssContent={designState.css}
                        className="mx-auto"
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </div>
                </div>
                
                {showCode && (
                  <div className="h-64 border-t overflow-auto bg-gray-50 dark:bg-gray-800 p-4">
                    <div className="flex space-x-4 mb-2">
                      <Button 
                        size="sm" 
                        variant={activeCodeTab === 'html' ? 'secondary' : 'outline'}
                        onClick={() => handleCodeTabChange('html')}
                      >
                        HTML
                      </Button>
                      <Button 
                        size="sm" 
                        variant={activeCodeTab === 'css' ? 'secondary' : 'outline'}
                        onClick={() => handleCodeTabChange('css')}
                      >
                        CSS
                      </Button>
                    </div>
                    <pre className="bg-white dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm text-gray-800 dark:text-gray-200 h-40">
                      {activeCodeTab === 'html' ? designState.html : designState.css}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Assistant */}
            <div className="w-full md:w-96 h-1/2 md:h-full border-t md:border-t-0 md:border-l">
              <AIDesignAssistant 
                onGenerateDesign={handleGenerateDesign} 
                currentHtml={designState.html}
                currentCss={designState.css}
                selectedFormat={selectedFormat}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 