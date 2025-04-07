"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { generateDesign } from '@/services/ai-service';
import { FormatOption } from './FormatSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIDesignAssistantProps {
  onGenerateDesign: (html: string, css: string) => void;
  currentHtml?: string;
  currentCss?: string;
  selectedFormat: FormatOption | null;
}

export default function AIDesignAssistant({ 
  onGenerateDesign, 
  currentHtml = '', 
  currentCss = '',
  selectedFormat
}: AIDesignAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: selectedFormat 
        ? `Hi! I'm your AI design assistant powered by GPT-4o. I'll help you create a ${selectedFormat.name} (${selectedFormat.width}×${selectedFormat.height}px). Describe what you'd like to create, and I'll generate the design with HTML, CSS, and SVG.` 
        : 'Hi! I\'m your AI design assistant powered by GPT-4o. Describe what you\'d like to create, and I\'ll help you build it with HTML, CSS, and SVG. Try asking for things like "Create a navigation bar with a logo and menu", "Make a product card with an image and buy button", or "Design a colorful header with a gradient background".'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial message when format changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '1') {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: selectedFormat 
            ? `Hi! I'm your AI design assistant powered by GPT-4o. I'll help you create a ${selectedFormat.name} (${selectedFormat.width}×${selectedFormat.height}px). Describe what you'd like to create, and I'll generate the design with HTML, CSS, and SVG.` 
            : 'Hi! I\'m your AI design assistant powered by GPT-4o. Describe what you\'d like to create, and I\'ll help you build it with HTML, CSS, and SVG.'
        }
      ]);
    }
  }, [selectedFormat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Call our AI service with the user's prompt, current design state, and format information
      const response = await generateDesign(
        userMessage.content, 
        currentHtml, 
        currentCss,
        selectedFormat
      );
      
      // Update the design with the generated HTML and CSS
      onGenerateDesign(response.content.html, response.content.css);

      // Add AI response
      addAssistantMessage(response.message);
      
      // Reset error count on success
      setErrorCount(0);
    } catch (error) {
      console.error('Error processing design request:', error);
      setErrorCount(prev => prev + 1);
      
      // Add appropriate error message based on error count
      if (errorCount >= 2) {
        addAssistantMessage('I\'m having trouble connecting to the AI service. Please check your internet connection or try again later. In the meantime, you can continue using the basic design tools.');
      } else {
        addAssistantMessage('Sorry, I encountered an error while generating your design. Please try again with a different description.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate format-specific suggestions
  const getSuggestedPrompts = () => {
    if (!selectedFormat) return defaultSuggestedPrompts;
    
    switch (selectedFormat.id) {
      case 'instagram-square':
      case 'instagram-story':
        return [
          "Create a product showcase with a gradient background",
          "Design a quote post with elegant typography",
          "Make a minimalist photo frame with subtle shadow",
          "Design a vibrant event announcement",
          "Create a modern profile bio layout",
        ];
      case 'facebook-post':
      case 'twitter-post':
      case 'linkedin-post':
        return [
          "Design a professional business announcement",
          "Create a news update with headline and summary",
          "Make a data visualization with key statistics",
          "Design a job posting with company branding",
          "Create an article preview with image and text",
        ];
      case 'pinterest-pin':
        return [
          "Design a DIY tutorial with step indicators",
          "Create a recipe card with ingredients list",
          "Make a fashion lookbook with style tips",
          "Design a travel inspiration board",
          "Create a home decor idea showcase",
        ];
      case 'youtube-thumbnail':
        return [
          "Create an eye-catching video thumbnail with text overlay",
          "Design a tutorial thumbnail with numbered steps",
          "Make a reaction video thumbnail with expressive elements",
          "Design a gaming thumbnail with game logo",
          "Create a vlog thumbnail with location indicators",
        ];
      case 'poster-a4':
        return [
          "Design a movie poster with dramatic lighting",
          "Create a concert flyer with artist information",
          "Make a conference poster with schedule",
          "Design a promotional sale poster with pricing",
          "Create an educational infographic with sections",
        ];
      default:
        return defaultSuggestedPrompts;
    }
  };

  // Default suggested prompts
  const defaultSuggestedPrompts = [
    "Create a hero section with a heading and call-to-action button",
    "Design a contact form with name, email, and message fields",
    "Make a pricing table with three tiers",
    "Create a timeline showing 4 events",
    "Design a blue color scheme for a professional website"
  ];

  const suggestedPrompts = getSuggestedPrompts();

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Design Assistant</h2>
        {selectedFormat && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Format: {selectedFormat.name} • {selectedFormat.width}×{selectedFormat.height}px
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Generating design with GPT-4o...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested prompts */}
      {messages.length < 3 && !isProcessing && (
        <div className="px-4 py-2 border-t">
          <p className="text-xs text-gray-500 mb-2">Try one of these prompts:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Describe your ${selectedFormat?.name || 'design'} idea...`}
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputValue.trim()}
          >
            {isProcessing ? 'Generating...' : 'Send'}
          </Button>
        </div>
        {isProcessing && (
          <p className="text-xs text-gray-500 mt-2">
            This might take a moment while the AI generates your design...
          </p>
        )}
      </div>
    </div>
  );
} 