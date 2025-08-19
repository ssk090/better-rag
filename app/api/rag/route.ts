import { NextRequest, NextResponse } from "next/server";
import { createLangChainProcessor } from "@/lib/langchain-utils";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, sources, apiKey, provider = "openai" } = body;

    // Validate input
    if (!question || !sources || sources.length === 0) {
      return NextResponse.json(
        { error: "Question and sources are required" },
        { status: 400 }
      );
    }

    // Check if API key is provided
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    // Simulate AI processing (replace with actual AI API calls)
    const response = await processWithAI(question, sources, apiKey, provider);

    return NextResponse.json({
      success: true,
      answer: response,
      timestamp: new Date().toISOString(),
      sources: sources.map((source: any) => ({
        id: source.id,
        type: source.type,
        name: source.name,
      })),
    });
  } catch (error) {
    console.error("RAG API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function processWithAI(
  question: string,
  sources: any[],
  apiKey: string,
  provider: string
): Promise<string> {
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
    const openai = new OpenAI({
      apiKey,
    });

    // System prompt for RAG
    const SYSTEM_PROMPT = `You are a knowledgeable AI assistant that provides accurate, helpful responses based on the provided context.

IMPORTANT GUIDELINES:
1. Base your answers ONLY on the context provided below
2. If the question cannot be answered using the available context, clearly state: "I cannot answer this question based on the available context."
3. Always cite the specific source or document section when providing information
4. Be concise but thorough in your explanations
5. If the context contains multiple relevant pieces of information, synthesize them coherently
6. Maintain a helpful and professional tone

CONTEXT INFORMATION:
${context}

Remember: Only use the information provided in the context above. Do not rely on external knowledge or make assumptions.`;

    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    return responseText;
  } catch (error) {
    console.error("AI processing error:", error);

    // Fallback to simple response if AI fails
    const sourceTypes = sources.map((s) => s.type).join(", ");
    const sourceCount = sources.length;

    return `Based on your ${sourceCount} source(s) (${sourceTypes}), here's what I found regarding your question: "${question}"

I encountered an error while processing your request with AI. This could be due to:
- API key issues
- Network connectivity problems
- Vector database connection issues

Please check your API key and try again. For now, I can only provide this basic response based on your sources.`;
  }
}
