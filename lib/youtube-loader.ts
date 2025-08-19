export interface YouTubeTranscriptResult {
  url: string;
  title?: string;
  description?: string;
  transcript: string;
  metadata: {
    language: string;
    videoId: string;
    duration?: number;
    viewCount?: number;
    uploadDate?: string;
  };
}

export async function extractYouTubeTranscript(
  url: string,
  language: string = "en"
): Promise<YouTubeTranscriptResult> {
  try {
    // Call our API endpoint instead of running the loader directly
    const response = await fetch("/api/youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, language }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Failed to extract transcript");
    }

    return result.data;
  } catch (error) {
    console.error("Error extracting YouTube transcript:", error);
    throw new Error(
      `Failed to extract transcript: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
  ];

  return youtubePatterns.some((pattern) => pattern.test(url));
}
