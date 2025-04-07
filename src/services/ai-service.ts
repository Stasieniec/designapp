"use client";

import { FormatOption } from '@/components/FormatSelector';

interface AIResponseContent {
  html: string;
  css: string;
  explanation: string;
}

interface AIResponse {
  content: AIResponseContent;
  message: string;
}

export async function generateDesign(
  prompt: string, 
  currentHtml: string = '', 
  currentCss: string = '',
  selectedFormat: FormatOption | null = null
): Promise<AIResponse> {
  try {
    // Show a mock response during development if the API call fails
    const useMockOnFailure = true;
    
    try {
      // Call our API endpoint that safely communicates with OpenAI
      const response = await fetch('/api/ai-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, currentHtml, currentCss, selectedFormat })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'API request failed');
      }
      
      return await response.json();
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      
      // If we've set the fallback flag to false or we're in production, propagate the error
      if (!useMockOnFailure || process.env.NODE_ENV === 'production') {
        throw apiError;
      }
      
      console.warn('Falling back to mock implementation...');
      return generateMockDesign(prompt, currentHtml, currentCss, selectedFormat);
    }
  } catch (error) {
    console.error('Error generating design:', error);
    throw new Error('Failed to generate design. Please try again.');
  }
}

// Fallback mock implementation (moved to a separate function)
async function generateMockDesign(
  prompt: string, 
  currentHtml: string = '', 
  currentCss: string = '',
  selectedFormat: FormatOption | null = null
): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // If we have current HTML and CSS, we'll use them as a base for our edits
  // This simulates the LLM understanding the current state and making changes
  let html = currentHtml;
  let css = currentCss;
  const isEditingExisting = currentHtml.length > 0 && currentCss.length > 0 && 
                          !currentHtml.includes('empty-design');
  
  // If we're editing existing content, generate a different message
  let message = '';
  
  if (isEditingExisting) {
    // Simulate modifying existing content rather than creating from scratch
    message = `I've updated your design based on your request: "${prompt}". You can see the changes in the preview panel. What else would you like to modify?`;
  } else {
    message = `Here's a design based on your request: "${prompt}". You can see it in the preview panel. What would you like to change?`;
  }
  
  // Parse user request to create somewhat responsive designs
  const isColorRequest = prompt.toLowerCase().includes('color') || prompt.toLowerCase().includes('blue') || 
                        prompt.toLowerCase().includes('red') || prompt.toLowerCase().includes('green');
  const isLayoutRequest = prompt.toLowerCase().includes('layout') || prompt.toLowerCase().includes('grid') || 
                         prompt.toLowerCase().includes('flex');
  const isButtonRequest = prompt.toLowerCase().includes('button') || prompt.toLowerCase().includes('cta');
  const isCardRequest = prompt.toLowerCase().includes('card') || prompt.toLowerCase().includes('box');
  const isHeaderRequest = prompt.toLowerCase().includes('header') || prompt.toLowerCase().includes('title');
  
  // Get format dimensions for responsive design
  const width = selectedFormat?.width || 1200;
  const height = selectedFormat?.height || 800;
  const isVertical = height > width;
  const isSquare = Math.abs(height - width) < 50;
  const formatName = selectedFormat?.name || 'Custom Design';
  
  // Set up default HTML for common formats
  if (!isEditingExisting) {
    if (selectedFormat?.id === 'instagram-square' || (isSquare && prompt.toLowerCase().includes('instagram'))) {
      html = `<div class="instagram-post">
  <div class="post-header">
    <div class="profile-pic"></div>
    <div class="account-info">
      <div class="username">your_brand</div>
      <div class="location">Location</div>
    </div>
  </div>
  <div class="post-content">
    <div class="post-image">
      <div class="overlay-text">Your message here</div>
    </div>
  </div>
  <div class="post-actions">
    <div class="action-icons">
      <span class="icon heart">♥</span>
      <span class="icon comment">✉</span>
      <span class="icon share">⤴</span>
    </div>
    <div class="likes">Liked by <strong>user</strong> and <strong>others</strong></div>
    <div class="caption"><strong>your_brand</strong> ${prompt}</div>
  </div>
</div>`;
      
      css = `.instagram-post {
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}
.post-header {
  padding: 10px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #efefef;
}
.profile-pic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  margin-right: 10px;
}
.username {
  font-weight: bold;
  font-size: 14px;
}
.location {
  font-size: 12px;
  color: #666;
}
.post-content {
  flex: 1;
  position: relative;
  background: #f3f3f3;
}
.post-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.overlay-text {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.post-actions {
  padding: 10px;
}
.action-icons {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}
.icon {
  font-size: 20px;
  cursor: pointer;
}
.heart {
  color: #ed4956;
}
.likes {
  font-size: 14px;
  margin-bottom: 5px;
}
.caption {
  font-size: 14px;
  margin-bottom: 5px;
}`;
    }
  }
  
  // Generate appropriate HTML and CSS based on the request if not already set
  if (!html || !css) {
    if (isHeaderRequest) {
      html = `<header class="site-header">
  <h1>${prompt.replace(/header|title/gi, '').trim() || 'Beautiful Header'}</h1>
  <p class="tagline">A stunning ${formatName} created with AI</p>
</header>`;
      
      css = `.site-header {
  text-align: center;
  padding: ${isVertical ? '2rem 1rem' : '3rem 1rem'};
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border-radius: 8px;
  width: 100%;
  height: ${isVertical ? '30%' : '50%'};
  display: flex;
  flex-direction: column;
  justify-content: center;
}
h1 {
  font-size: ${width > 1000 ? '2.5rem' : '2rem'};
  margin-bottom: 1rem;
  font-weight: bold;
}
.tagline {
  font-size: ${width > 1000 ? '1.2rem' : '1rem'};
  opacity: 0.8;
}`;
    } else if (isButtonRequest) {
      html = `<div class="button-container">
  <button class="primary-button">${prompt.replace(/button|cta/gi, '').trim() || 'Click Me'}</button>
  <button class="secondary-button">Learn More</button>
</div>`;
      
      css = `.button-container {
  display: flex;
  ${isVertical ? 'flex-direction: column;' : ''}
  gap: 1rem;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
}
.primary-button, .secondary-button {
  padding: ${width > 1000 ? '0.75rem 1.5rem' : '0.5rem 1rem'};
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${width > 1000 ? '1rem' : '0.875rem'};
}
.primary-button {
  background-color: #4361ee;
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(67, 97, 238, 0.3);
}
.primary-button:hover {
  background-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(67, 97, 238, 0.4);
}
.secondary-button {
  background-color: transparent;
  color: #4361ee;
  border: 2px solid #4361ee;
}
.secondary-button:hover {
  background-color: rgba(67, 97, 238, 0.1);
}`;
    } else if (isCardRequest) {
      html = `<div class="card">
  <div class="card-image"></div>
  <div class="card-content">
    <h2>${prompt.replace(/card|box/gi, '').trim() || 'Card Title'}</h2>
    <p>This is a beautiful card design for your ${formatName}. You can customize this content as needed.</p>
    <button class="card-button">Learn More</button>
  </div>
</div>`;
      
      css = `.card {
  width: ${isVertical ? '90%' : '70%'};
  max-width: ${width * 0.8}px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: ${isVertical ? '80%' : '90%'};
  display: flex;
  flex-direction: ${isVertical ? 'column' : 'row'};
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}
.card-image {
  ${isVertical ? 'height: 40%;' : 'width: 40%;'}
  background: linear-gradient(45deg, #5E60CE, #64DFDF);
  background-size: cover;
  background-position: center;
}
.card-content {
  padding: 1.5rem;
  ${isVertical ? '' : 'width: 60%;'}
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-content h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: ${width > 1000 ? '1.5rem' : '1.25rem'};
}
.card-content p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  font-size: ${width > 1000 ? '1rem' : '0.875rem'};
}
.card-button {
  background: #5E60CE;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
  align-self: ${isVertical ? 'center' : 'flex-start'};
}
.card-button:hover {
  background: #4C4BB0;
}`;
    } else if (isLayoutRequest) {
      const columns = isVertical ? 2 : 3;
      
      html = `<div class="grid-layout">
  <div class="grid-item item1">Item 1</div>
  <div class="grid-item item2">Item 2</div>
  <div class="grid-item item3">Item 3</div>
  <div class="grid-item item4">Item 4</div>
  <div class="grid-item item5">Item 5</div>
  <div class="grid-item item6">Item 6</div>
</div>`;
      
      css = `.grid-layout {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-gap: ${width > 1000 ? '1rem' : '0.5rem'};
  padding: 1rem;
  width: 100%;
  height: 100%;
}
.grid-item {
  padding: ${width > 1000 ? '2rem' : '1rem'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: ${width > 1000 ? '1rem' : '0.75rem'};
}
.item1 { background: #ef476f; }
.item2 { background: #ffd166; }
.item3 { background: #06d6a0; }
.item4 { background: #118ab2; }
.item5 { background: #073b4c; }
.item6 { background: #7f5539; }`;
    } else if (isColorRequest) {
      const colorMap: Record<string, string> = {
        'blue': '#1a73e8',
        'red': '#ea4335',
        'green': '#34a853',
        'yellow': '#fbbc05',
        'purple': '#7e57c2',
        'pink': '#e91e63',
        'orange': '#ff9800',
        'teal': '#009688'
      };
      
      // Extract color from prompt
      let color = '#4285f4'; // Default blue
      Object.keys(colorMap).forEach(colorName => {
        if (prompt.toLowerCase().includes(colorName)) {
          color = colorMap[colorName];
        }
      });
      
      const layout = isVertical ? 'flex-direction: column;' : 'flex-direction: row;';
      
      html = `<div class="color-palette">
  <div class="color-card main-color">
    <div class="color-name">Main Color</div>
  </div>
  <div class="color-card light-color">
    <div class="color-name">Light Shade</div>
  </div>
  <div class="color-card dark-color">
    <div class="color-name">Dark Shade</div>
  </div>
  <div class="color-sample">
    <h2>Sample Heading</h2>
    <p>This is how text would look with your color scheme.</p>
    <button class="sample-button">Sample Button</button>
  </div>
</div>`;
      
      css = `.color-palette {
  display: flex;
  ${layout}
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.color-card {
  width: ${isVertical ? '100px' : '150px'};
  height: ${isVertical ? '100px' : '150px'};
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.color-name {
  width: 100%;
  padding: 0.5rem;
  text-align: center;
  background: rgba(255,255,255,0.9);
  font-weight: bold;
  font-size: ${width > 1000 ? '0.875rem' : '0.75rem'};
}
.main-color {
  background-color: ${color};
}
.light-color {
  background-color: ${adjustColor(color, 40)};
}
.dark-color {
  background-color: ${adjustColor(color, -40)};
}
.color-sample {
  width: 100%;
  max-width: ${isVertical ? '100%' : '500px'};
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-top: 1rem;
}
.color-sample h2 {
  color: ${color};
  margin-top: 0;
  font-size: ${width > 1000 ? '1.5rem' : '1.25rem'};
}
.color-sample p {
  color: #333;
  line-height: 1.5;
  font-size: ${width > 1000 ? '1rem' : '0.875rem'};
}
.sample-button {
  background: ${color};
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: ${width > 1000 ? '1rem' : '0.875rem'};
}
.sample-button:hover {
  background: ${adjustColor(color, -20)};
}`;
    } else {
      // Default response for any other request
      html = `<div class="design-container">
  <h1>AI Generated ${formatName}</h1>
  <p>This is a design based on your request: "${prompt}"</p>
  <div class="sample-element"></div>
</div>`;
      
      css = `.design-container {
  padding: 2rem;
  text-align: center;
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: ${width > 1000 ? '2rem' : '1.5rem'};
}
p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: ${width > 1000 ? '1rem' : '0.875rem'};
}
.sample-element {
  width: ${width * 0.25}px;
  height: ${height * 0.25}px;
  margin: 0 auto;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border-radius: 50%;
  animation: pulse 2s infinite alternate;
}
@keyframes pulse {
  from {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(174, 174, 174, 0.5);
  }
  to {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(120, 120, 219, 0.7);
  }
}`;
    }
  }

  const response: AIResponse = {
    content: {
      html,
      css,
      explanation: `I created a design based on your request for ${prompt}. This design is optimized for ${formatName} format (${width}×${height}px).`
    },
    message
  };

  return response;
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
} 