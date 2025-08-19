import { NextRequest, NextResponse } from "next/server";
import {
  createLangChainProcessor,
  isFileSupported,
} from "@/lib/langchain-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents, apiKey, provider = "openai" } = body;

    // Validate input
    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "Documents are required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    // Create LangChain processor
    const processor = createLangChainProcessor(apiKey);

    // Convert base64/File objects to actual File objects
    const files = await Promise.all(
      documents.map(async (doc: any) => {
        if (doc.content && doc.content.startsWith("data:")) {
          // Convert base64 to File object
          const base64Data = doc.content.split(",")[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const file = new File([bytes], doc.name, { type: doc.type });
          // Add the original ID to the file object for later reference
          (file as any).originalId = doc.id;
          return file;
        } else if (doc.file) {
          // Handle File object from FormData
          return doc.file;
        } else {
          throw new Error(`Invalid document format for ${doc.name}`);
        }
      })
    );

    // Validate file types
    const invalidFiles = files.filter((file) => !isFileSupported(file));
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          error: `Unsupported file types: ${invalidFiles
            .map((f) => f.name)
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    try {
      const result = await processor.processFiles(files, apiKey);

      if (!result.success) {
        console.error("Processing failed:", result.error);
        return NextResponse.json(
          { error: result.error || "Failed to process documents" },
          { status: 500 }
        );
      }

      if (!result.documents || result.documents.length === 0) {
        console.warn("Processing succeeded but no documents returned");
        return NextResponse.json(
          {
            success: false,
            error: "No documents were processed successfully",
            processedFiles: files.length,
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
      console.error("Error during document processing:", processingError);
      return NextResponse.json(
        {
          success: false,
          error: `Document processing failed: ${
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
    console.error("Document Processing API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
