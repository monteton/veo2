
import { GoogleGenAI } from "@google/genai";

// A utility function to introduce a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateVideoFromImage(
    userPrompt: string, 
    imageBase64: string, 
    mimeType: string
): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Enhance prompt to guide the model towards a vertical aspect ratio
    const fullPrompt = `A vertical video with a 9:16 aspect ratio. ${userPrompt}`;

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: fullPrompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1
        }
    });

    // Poll for the result, as video generation is asynchronous
    while (!operation.done) {
        console.log("Video generation in progress. Waiting...");
        await sleep(10000); // Wait for 10 seconds before checking again
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch(e) {
          console.error("Error polling for video operation status:", e);
          throw new Error("Failed to get video generation status.");
        }
    }
    
    console.log("Video generation complete.");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        console.error("No download link found in the operation response:", operation);
        throw new Error("Video was generated but no download link was provided.");
    }
    
    // Fetch the video file using the download link and the API key
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download the generated video. Status: ${videoResponse.status}`);
    }

    // Convert the video data to a blob URL to be used in the <video> tag
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return videoUrl;
}
