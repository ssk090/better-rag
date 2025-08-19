// AI Provider configurations and integration examples

export interface AIProvider {
  name: string;
  baseUrl: string;
  apiKeyHeader: string;
  model: string;
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    apiKeyHeader: "Authorization",
    model: "gpt-4o-mini",
  },
  anthropic: {
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    apiKeyHeader: "x-api-key",
    model: "claude-3-haiku-20240307",
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyHeader: "Authorization",
    model: "llama3-8b-8192",
  },
};

// Example OpenAI integration
export async function callOpenAI(
  question: string,
  sources: string[],
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Answer questions based on the provided sources. 
          If the information is not in the sources, say so. Always cite your sources when possible.`,
        },
        {
          role: "user",
          content: `Sources: ${sources.join("\n\n")}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response from AI";
}

// Example Anthropic integration
export async function callAnthropic(
  question: string,
  sources: string[],
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Based on these sources:\n\n${sources.join(
            "\n\n"
          )}\n\nPlease answer this question: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "No response from AI";
}

// Example Groq integration
export async function callGroq(
  question: string,
  sources: string[],
  apiKey: string
): Promise<string> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant. Answer questions based on the provided sources. 
          If the information is not in the sources, say so. Always cite your sources when possible.`,
          },
          {
            role: "user",
            content: `Sources: ${sources.join(
              "\n\n"
            )}\n\nQuestion: ${question}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response from AI";
}

// Generic AI provider function
export async function callAIProvider(
  provider: string,
  question: string,
  sources: string[],
  apiKey: string
): Promise<string> {
  switch (provider) {
    case "openai":
      return callOpenAI(question, sources, apiKey);
    case "anthropic":
      return callAnthropic(question, sources, apiKey);
    case "groq":
      return callGroq(question, sources, apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
