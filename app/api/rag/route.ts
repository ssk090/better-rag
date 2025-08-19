import { NextRequest } from "next/server";
import { createLangChainProcessor } from "@/lib/langchain-utils";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, sources, apiKey, provider = "openai" } = body;

    // Validate input
    if (!question || !sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: "Question and sources are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if API key is provided
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create streaming response
    const stream = await processWithAIStream(
      question,
      sources,
      apiKey,
      provider
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("RAG API Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function processWithAIStream(
  question: string,
  sources: any[],
  apiKey: string,
  provider: string
): Promise<ReadableStream> {
  try {
    // Create LangChain processor for vector search
    const processor = createLangChainProcessor(apiKey);

    // Initialize vector store
    await processor.initializeVectorStore();

    // Search for relevant documents
    const relevantChunks = await processor.searchDocuments(question, 5);

    // Prepare context from sources and vector search
    let context = "";

    // Add source content
    sources.forEach((source) => {
      if (source.content) {
        context += `Source: ${source.name}\nContent: ${source.content}\n\n`;
      }
    });

    // Add relevant chunks from vector store
    if (relevantChunks.length > 0) {
      context += "Relevant information from knowledge base:\n";
      relevantChunks.forEach((chunk, index) => {
        context += `${index + 1}. ${chunk.pageContent}\n\n`;
      });
    }

    // Create OpenAI client
    const client = new OpenAI({
      apiKey,
    });

    // System prompt for RAG
    const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided context.

Your task is to answer the user's question using ONLY the information provided in the context below. 

IMPORTANT:
- Answer the question directly and helpfully
- Use the context information to provide accurate answers
- Cite sources when possible
- Be conversational and helpful
- Do NOT repeat the user's question back to them

CONTEXT INFORMATION:
${context}

Now answer the user's question: "${question}"`;

    // Get AI response with streaming using the newer API
    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      temperature: 0,
      max_tokens: 1000,
      stream: true,
    });

    // Use a more direct streaming approach
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";
          for await (const event of stream) {
            const content = event.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error("AI processing error:", error);

    // Return error as stream
    const encoder = new TextEncoder();
    const errorMessage = `Error: I encountered an issue while processing your request. Please check your API key and try again.`;

    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      },
    });
  }
}
