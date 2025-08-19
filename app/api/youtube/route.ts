import { NextRequest, NextResponse } from "next/server";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, language = "en" } = body;

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    // Create the YouTube loader
    const loader = YoutubeLoader.createFromUrl(url, {
      language,
      addVideoInfo: true,
    });

    // Load the documents (transcripts)
    const docs = await loader.load();

    if (docs.length === 0) {
      return NextResponse.json(
        { error: "No transcript found for this video" },
        { status: 404 }
      );
    }

    // Extract transcript content
    const transcript = docs.map((doc) => doc.pageContent).join("\n");

    // Extract metadata from the first document
    const firstDoc = docs[0];
    const metadata = firstDoc.metadata;

    const result = {
      url,
      title: metadata.title,
      description: metadata.description,
      transcript,
      metadata: {
        language: metadata.language || language,
        videoId: metadata.videoId || extractVideoId(url),
        duration: metadata.duration,
        viewCount: metadata.viewCount,
        uploadDate: metadata.uploadDate,
      },
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("YouTube API Error:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("Failed to get YouTube video transcription")) {
        return NextResponse.json(
          { error: "Failed to extract transcript. The video might not have captions or they might be disabled." },
          { status: 400 }
        );
      }
      if (error.message.includes("Invalid YouTube URL")) {
        return NextResponse.json(
          { error: "Invalid YouTube URL format" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to extract YouTube transcript" },
      { status: 500 }
    );
  }
}

function isValidYouTubeUrl(url: string): boolean {
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
  ];

  return youtubePatterns.some((pattern) => pattern.test(url));
}

function extractVideoId(url: string): string {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  throw new Error("Invalid YouTube URL format");
}
