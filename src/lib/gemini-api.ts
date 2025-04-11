
import { ReportItem } from "./pdf-utils";

interface GeminiAnalysisResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function testGeminiAPI(): Promise<{ success: boolean; message: string }> {
  const API_KEY = "AIzaSyCRCDRe-VegAXICAZEf8EaLNeneaHr9V3w";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
  try {
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
        message: `API Error: ${response.status} - ${errorText.substring(0, 100)}...` 
      };
    }
    
    const data = await response.json();
    return { 
      success: true, 
      message: "Gemini API is working correctly!" 
    };
  } catch (error) {
    console.error("Gemini API connection error:", error);
    return { 
      success: false, 
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

export async function analyzeImagesWithGemini(
  prompt: string,
  images: { id: string; dataUrl: string; file?: File }[]
): Promise<{ [key: string]: string }> {
  const API_KEY = "AIzaSyCRCDRe-VegAXICAZEf8EaLNeneaHr9V3w";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
  const results: { [key: string]: string } = {};
  
  // Process each image individually to get specific analysis
  for (const image of images) {
    try {
      console.log("Processing image:", image.id);
      
      // Convert dataUrl to base64 content required by Gemini
      const base64Content = image.dataUrl.split(',')[1];
      
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${prompt}\nPlease provide a detailed but concise assessment of this image for a property inventory report.` },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
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
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const data: GeminiAnalysisResponse = await response.json();
      console.log("Gemini API response:", data);
      
      const analysisText = data.candidates[0]?.content?.parts[0]?.text || 
                          "Analysis not available";
      
      // Store the result with the image ID as key
      results[image.id] = analysisText;
      console.log("Added analysis for image:", image.id);
      
    } catch (error) {
      console.error("Error analyzing image with Gemini:", error);
      results[image.id] = `Error analyzing this image: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
  
  console.log("All results:", results);
  return results;
}

export function enhanceReportWithAIAnalysis(
  reportItems: ReportItem[],
  aiAnalysisResults: { [key: string]: string }
): ReportItem[] {
  return reportItems.map(item => {
    // If this item has AI analysis results, include them in the notes
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
