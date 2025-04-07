import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, currentHtml, currentCss, selectedFormat } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get format information for the prompt
    const formatInfo = selectedFormat ? 
      `Format: ${selectedFormat.name} (${selectedFormat.width}×${selectedFormat.height}px)` : 
      'No specific format selected';

    // Craft a detailed system prompt for design generation
    const systemPrompt = `You are an expert web designer and developer specializing in creating beautiful, responsive designs with HTML, CSS, and SVG. 
    
Your task is to generate clean, valid HTML and CSS code that implements the design described by the user.

${selectedFormat ? `IMPORTANT - FORMAT INFORMATION:
You are designing for: ${selectedFormat.name}
Dimensions: ${selectedFormat.width}×${selectedFormat.height}px
Aspect ratio: ${selectedFormat.width}:${selectedFormat.height}
Orientation: ${selectedFormat.height > selectedFormat.width ? 'Portrait/Vertical' : 'Landscape/Horizontal'}

Your design must be optimized for these exact dimensions. Create responsive designs that work perfectly at this size.
` : ''}

Follow these guidelines:
1. Create visually appealing, modern designs using current best practices
2. Ensure the HTML is semantic and accessible
3. Write responsive CSS that works well on all devices
4. Use CSS animations and transitions for subtle interactive elements
5. Implement appropriate color schemes and typography
6. Keep your code clean, well-formatted, and easy to understand
7. ALWAYS center content both vertically and horizontally by default unless specifically requested otherwise
8. Use flexbox (display: flex, justify-content: center, align-items: center) for all container elements to ensure proper centering
9. Make sure the root container has width: 100% and height: 100% to fill the available space
10. CRITICAL: Ensure all content stays WITHIN BOUNDS - your design must fit exactly within ${selectedFormat?.width}×${selectedFormat?.height}px
11. Feel free to use absolute positioning for precise pixel-level control, but ALWAYS position elements relative to the main container
12. When using absolute positioning, make sure your coordinates keep elements fully within the design container's dimensions

${currentHtml && currentCss ? "The user already has an existing design. Review and modify it according to their request while preserving their overall structure when appropriate." : "Create a new design based on the user's description."}

CRITICALLY IMPORTANT RESPONSE FORMAT INSTRUCTIONS:
Your response MUST be a raw JSON object without any markdown formatting (no \`\`\` markers).
DO NOT wrap your response in code blocks or markdown formatting.
DO NOT include any explanatory text outside the JSON.
ONLY return the raw JSON.

Your response must exactly match this structure:
{
  "html": "the complete HTML code",
  "css": "the complete CSS code",
  "explanation": "brief explanation of the design"
}

Example of correct response format:
{"html":"<div class=\\"container\\"><h1>Example</h1></div>","css":".container{padding:20px;}","explanation":"A simple container with a heading"}

Example of INCORRECT response format (DO NOT USE):
\`\`\`json
{"html":"<div>...</div>","css":"...","explanation":"..."}
\`\`\`

Again, you must ONLY return the raw JSON object with no markdown or text outside the JSON.`;

    // Prepare messages for the conversation
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // If there's existing code, include it for context
    if (currentHtml && currentCss) {
      messages.push({
        role: "user", 
        content: `Here is my current design:\n\nHTML:\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nCSS:\n\`\`\`css\n${currentCss}\n\`\`\`\n\n${formatInfo}\n\nI would like you to ${prompt}`
      });
    } else {
      messages.push({
        role: "user", 
        content: `${formatInfo}\n\n${prompt}`
      });
    }

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Parse the response
    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    try {
      // Parse the JSON response
      // Clean up the response if it contains Markdown code block formatting
      let jsonString = content;
      
      // Remove markdown code block formatting if present
      if (jsonString.startsWith('```')) {
        // Extract the content between the code block markers
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
        const match = jsonString.match(codeBlockRegex);
        if (match && match[1]) {
          jsonString = match[1].trim();
        } else {
          // If regex fails, try a simpler approach to strip the markers
          jsonString = jsonString.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
        }
      }
      
      const jsonResponse = JSON.parse(jsonString);
      
      // Validate that the JSON has the expected structure
      if (!jsonResponse.html || !jsonResponse.css) {
        console.error('Invalid JSON structure returned by OpenAI:', jsonResponse);
        throw new Error('The AI response is missing required fields');
      }
      
      return NextResponse.json({
        content: {
          html: jsonResponse.html,
          css: jsonResponse.css,
          explanation: jsonResponse.explanation || 'Design created based on your description',
        },
        message: `I've ${currentHtml && currentCss ? 'updated' : 'created'} the design based on your request. What would you like to change?`
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content, parseError);
      throw new Error('Received invalid response from AI');
    }
  } catch (error) {
    console.error('Error in AI design API:', error);
    return NextResponse.json(
      { error: 'Failed to generate design' },
      { status: 500 }
    );
  }
} 