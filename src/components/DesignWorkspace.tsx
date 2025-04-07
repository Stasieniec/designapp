"use client";

import React, { useState, useRef, useEffect } from 'react';
import DesignSandbox, { DesignSandboxRef } from './DesignSandbox';
import AIDesignAssistant from './AIDesignAssistant';
import Button from './Button';
import FormatSelector, { FormatOption } from './FormatSelector';
import html2canvas from 'html2canvas';

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
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const exportOptionsRef = useRef<HTMLDivElement>(null);
  
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
}
.design-container > * {
  /* Ensure direct children of the container are centered */
  margin: 0 auto;
}
.placeholder-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #a0aec0;
  padding: 2rem;
  width: 100%;
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

  // Close export options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportOptionsRef.current && !exportOptionsRef.current.contains(event.target as Node)) {
        setShowExportOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const captureDesignAsImage = async (format: 'png' | 'jpg') => {
    if (!iframeRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Show a toast notification
      const exportFeedback = document.createElement('div');
      exportFeedback.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999;';
      exportFeedback.textContent = 'Preparing for export...';
      document.body.appendChild(exportFeedback);
      
      // Get dimensions
      const containerWidth = selectedFormat?.width || 1200;
      const containerHeight = selectedFormat?.height || 800;
      
      // Create a div in the document to render the design
      const renderDiv = document.createElement('div');
      renderDiv.style.position = 'absolute';
      renderDiv.style.top = '-9999px';
      renderDiv.style.left = '-9999px';
      renderDiv.style.width = `${containerWidth}px`;
      renderDiv.style.height = `${containerHeight}px`;
      renderDiv.style.background = 'white';
      renderDiv.style.overflow = 'hidden';
      document.body.appendChild(renderDiv);
      
      // Get the design content
      const { html, css } = designState;
      
      // Set the content of the div
      renderDiv.innerHTML = `
        <style>
          ${css}
          /* Force proper dimensions and centering */
          .design-container {
            width: ${containerWidth}px !important;
            height: ${containerHeight}px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            overflow: hidden !important;
            background: white !important;
          }
        </style>
        ${html}
      `;
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        exportFeedback.textContent = 'Capturing design...';
        
        // Use html2canvas to capture the content
        const canvas = await html2canvas(renderDiv, {
          width: containerWidth,
          height: containerHeight,
          scale: 2,
          backgroundColor: 'white',
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc, clonedElement) => {
            // Make sure design container fills the space
            const designContainer = clonedElement.querySelector('.design-container');
            if (designContainer) {
              (designContainer as HTMLElement).style.cssText = `
                width: ${containerWidth}px !important;
                height: ${containerHeight}px !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                overflow: hidden !important;
                background: white !important;
                position: relative !important;
              `;
            }
          }
        });
        
        // Convert to data URL
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.95 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Show the preview
        setPreviewImage(dataUrl);
        
        // Clean up
        document.body.removeChild(renderDiv);
        
        // Show success message
        exportFeedback.textContent = 'Export successful!';
        setTimeout(() => {
          document.body.removeChild(exportFeedback);
        }, 1000);
      } catch (error) {
        console.error('Export error:', error);
        document.body.removeChild(renderDiv);
        document.body.removeChild(exportFeedback);
        alert('Failed to export design. Please try again or use the HTML export option.');
      }
      
      // Close export options dropdown
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export design. Please try again or use the HTML export option.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCodeTabChange = (tab: 'html' | 'css') => {
    setActiveCodeTab(tab);
  };

  // Reference to the iframe element for image capture
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  // Function to get iframe reference from sandbox
  const getIframeRef = (iframe: HTMLIFrameElement) => {
    iframeRef.current = iframe;
  };

  const closePreview = () => {
    setPreviewImage(null);
  };
  
  const downloadPreviewImage = () => {
    if (!previewImage) return;
    
    // Get file format from data URL
    const format = previewImage.includes('image/jpeg') ? 'jpg' : 'png';
    
    // Create download link
    const a = document.createElement('a');
    a.href = previewImage;
    a.download = `${selectedFormat?.name || 'design'}-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    
    // Close preview
    closePreview();
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
                <div className="relative">
                  <Button 
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    disabled={isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                  {showExportOptions && (
                    <div 
                      ref={exportOptionsRef}
                      className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-10 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        Export as
                      </div>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                        onClick={handleExport}
                      >
                        <span className="mr-2">📄</span> HTML
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                        onClick={() => captureDesignAsImage('png')}
                        disabled={isExporting}
                      >
                        <span className="mr-2">🖼️</span> PNG Image
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                        onClick={() => captureDesignAsImage('jpg')}
                        disabled={isExporting}
                      >
                        <span className="mr-2">📸</span> JPG Image
                      </button>
                    </div>
                  )}
                </div>
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
                        getIframeRef={getIframeRef}
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
      
      {/* Image Preview Dialog */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="bg-white dark:bg-gray-800 max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Export Preview</h3>
              <button onClick={closePreview} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center bg-gray-100 dark:bg-gray-900">
              <div className="overflow-auto max-h-[70vh]">
                <img src={previewImage} alt="Export preview" className="shadow-lg" />
              </div>
            </div>
            <div className="p-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700">
              <Button variant="outline" onClick={closePreview}>
                Cancel
              </Button>
              <Button onClick={downloadPreviewImage}>
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 