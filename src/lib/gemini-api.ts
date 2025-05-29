
interface GeminiAnalysisResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function testGeminiAPI(): Promise<{ success: boolean; message: string; details?: any }> {
  const API_KEY = "AIzaSyCRCDRe-VegAXICAZEf8EaLNeneaHr9V3w";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
  try {
    console.log("Testing Gemini API connection...");
    // Simple test with text-only prompt
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Hello, this is a test message. Please respond with 'API is working'." }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API test failed:", errorText);
      return { 
        success: false, 
        message: `API Error: ${response.status} - ${response.statusText}`,
        details: errorText
      };
    }
    
    const data = await response.json();
    console.log("API Test Response:", data);
    
    return { 
      success: true, 
      message: "Gemini API is working correctly!",
      details: data
    };
  } catch (error) {
    console.error("Gemini API connection error:", error);
    return { 
      success: false, 
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Add the missing analyzeImages export - it should point to analyzeImagesWithGemini
export const analyzeImages = analyzeImagesWithGemini;

export async function analyzeImagesWithGemini(
  prompt: string,
  images: { id: string; dataUrl: string; file?: File }[]
): Promise<{ [key: string]: string }> {
  const API_KEY = "AIzaSyCRCDRe-VegAXICAZEf8EaLNeneaHr9V3w";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
  const results: { [key: string]: string } = {};
  
  if (images.length === 0) {
    console.log("No images to analyze");
    return results;
  }
  
  // First test with just one image to validate API is working
  try {
    const testImage = images[0];
    console.log("Testing API with first image:", testImage.id);
    
    // Convert dataUrl to base64 content required by Gemini
    const base64Content = testImage.dataUrl.split(',')[1];
    if (!base64Content) {
      throw new Error("Invalid image data format");
    }
    
    const testResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Please describe this image briefly." },
              {
                inline_data: {
                  mime_type: testImage.dataUrl.startsWith('data:image/png') ? "image/png" : "image/jpeg",
                  data: base64Content
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        }
      })
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error("Gemini API initial test failed:", errorText);
      throw new Error(`API Error: ${testResponse.status} - ${testResponse.statusText}`);
    }
    
    console.log("Initial API test successful, proceeding with full analysis");
  } catch (error) {
    console.error("Initial API test failed:", error);
    throw new Error(`API connection test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Process each image individually to get specific analysis
  for (const image of images) {
    try {
      console.log("Processing image:", image.id);
      
      // Convert dataUrl to base64 content required by Gemini
      const base64Content = image.dataUrl.split(',')[1];
      if (!base64Content) {
        console.error("Invalid image data for", image.id);
        results[image.id] = "Error: Invalid image data format";
        continue;
      }
      
      const mimeType = image.dataUrl.startsWith('data:image/png') ? "image/png" : 
                       image.dataUrl.startsWith('data:image/webp') ? "image/webp" : "image/jpeg";
      
      const effectivePrompt = prompt || "Please analyze this image in detail";
      console.log(`Sending image ${image.id} to Gemini with prompt: "${effectivePrompt.substring(0, 50)}..."`);
      
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${effectivePrompt}\nProvide a detailed but concise assessment of this image for a property inventory report.` },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Content
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error for image", image.id, ":", errorText);
        results[image.id] = `API Error: Could not analyze image (${response.status})`;
        continue;
      }
      
      const data: GeminiAnalysisResponse = await response.json();
      console.log("Gemini API response for image", image.id, ":", data);
      
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Analysis not available";
      
      // Store the result with the image ID as key
      results[image.id] = analysisText;
      console.log("Added analysis for image:", image.id);
      
    } catch (error) {
      console.error("Error analyzing image with Gemini:", image.id, error);
      results[image.id] = `Error analyzing this image: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
  
  console.log("All analysis results:", results);
  return results;
}

export function enhanceReportWithAIAnalysis(
  reportItems: ReportItem[],
  aiAnalysisResults: { [key: string]: string }
): ReportItem[] {
  return reportItems.map(item => {
    // If this item has AI analysis results, include them
    if (item.id in aiAnalysisResults) {
      return {
        ...item,
        aiAnalysis: aiAnalysisResults[item.id],
        // Keep the original notes in case the user added any
        notes: item.notes
      };
    }
    return item;
  });
}

interface ReportItem {
  id: string;
  description: string;
  condition: "Good" | "Fair" | "Poor";
  notes: string;
  aiAnalysis?: string;
  images: string[];
}

