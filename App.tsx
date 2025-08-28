
import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoFromImage } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { VideoPlayer } from './components/VideoPlayer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LOADING_MESSAGES } from './constants';
import { GenerationStatus } from './types';

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  // Fix: Correctly handle interval for loading messages in a browser environment.
  // Replaced NodeJS.Timeout with a more robust useEffect pattern that avoids type errors
  // and ensures the interval is properly cleared.
  useEffect(() => {
    if (status === GenerationStatus.LOADING) {
      const interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateClick = async () => {
    if (!prompt || !imageBase64 || !imageFile) {
      setError('Please provide an image and a text prompt.');
      return;
    }
    
    if (!process.env.API_KEY) {
      setError('API_KEY environment variable not found.');
      setStatus(GenerationStatus.ERROR);
      return;
    }

    setError(null);
    setGeneratedVideoUrl(null);
    setStatus(GenerationStatus.LOADING);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      const videoUrl = await generateVideoFromImage(prompt, imageBase64, imageFile.type);
      setGeneratedVideoUrl(videoUrl);
      setStatus(GenerationStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setError(`Video generation failed: ${e.message}`);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setImageFile(null);
    setImageBase64(null);
    setGeneratedVideoUrl(null);
    setStatus(GenerationStatus.IDLE);
    setError(null);
  };

  const isGenerating = status === GenerationStatus.LOADING;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans p-4">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl bg-gray-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700">
          {isGenerating && (
            <Loader message={loadingMessage} />
          )}

          {!isGenerating && generatedVideoUrl && (
             <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold text-center text-green-400">Generation Complete!</h2>
                <VideoPlayer src={generatedVideoUrl} />
                <button
                    onClick={handleReset}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                >
                    Create Another Video
                </button>
            </div>
          )}

          {!isGenerating && !generatedVideoUrl && (
            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="image-upload" className="block text-lg font-medium mb-2 text-indigo-300">1. Upload an Image</label>
                <FileUpload onFileSelect={handleFileSelect} selectedFile={imageFile} />
              </div>
              <div>
                <label htmlFor="prompt" className="block text-lg font-medium mb-2 text-indigo-300">2. Describe the Video</label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-200 placeholder-gray-500"
                  placeholder="e.g., A cinematic shot of a cat looking at a rainy window, dramatic lighting"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <button
                onClick={handleGenerateClick}
                disabled={!prompt || !imageFile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 text-xl"
              >
                Generate Vertical Video
              </button>
            </div>
          )}

          {status === GenerationStatus.ERROR && error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              <p className="font-semibold">An Error Occurred</p>
              <p>{error}</p>
               <button
                    onClick={handleReset}
                    className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                    Try Again
                </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
