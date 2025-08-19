import { NextRequest, NextResponse } from "next/server";
import { createLangChainProcessor } from "@/lib/langchain-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, apiKey, provider = "openai" } = body;

    // Validate input
    if (!urls || urls.length === 0) {
      return NextResponse.json({ error: "URLs are required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    // Validate URLs
    const validUrls = urls.filter((url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid URLs provided" },
        { status: 400 }
      );
    }

    // Create LangChain processor
    const processor = createLangChainProcessor(apiKey);

    try {
      const result = await processor.processUrls(validUrls, apiKey);

      if (!result.success) {
        console.error("URL processing failed:", result.error);
        return NextResponse.json(
          { error: result.error || "Failed to process URLs" },
          { status: 500 }
        );
      }

      if (!result.documents || result.documents.length === 0) {
        console.warn("URL processing succeeded but no documents returned");
        return NextResponse.json(
          {
            success: false,
            error: "No URLs were processed successfully",
            processedUrls: validUrls.length,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Store documents in vector database
      let storeResult;
      try {
        storeResult = await processor.storeDocuments(result.documents);
      } catch (error) {
        console.warn("Failed to store in vector database:", error);
        // Continue without vector storage for now
      }

      // Convert to response format
      const processedDocuments = result.documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        processed: doc.processed,
        chunks: doc.chunks.length,
        summary: doc.summary,
        timestamp: doc.timestamp,
        content:
          doc.content.substring(0, 500) +
          (doc.content.length > 500 ? "..." : ""), // Truncate for response
      }));

      return NextResponse.json({
        success: true,
        documents: processedDocuments,
        timestamp: new Date().toISOString(),
        vectorStoreResult: storeResult,
      });
    } catch (processingError) {
      console.error("Error during URL processing:", processingError);
      return NextResponse.json(
        {
          success: false,
          error: `URL processing failed: ${
            processingError instanceof Error
              ? processingError.message
              : "Unknown error"
          }`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("URL Processing API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
