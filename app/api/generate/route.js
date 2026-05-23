import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function parseJsonContent(text) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[^\}]*\}/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.type || !body.description) {
    return NextResponse.json(
      { error: "Request must include type and description." },
      { status: 400 },
    );
  }

  const prompt = `You are WTP, a helper that returns the exact word or phrase the user is trying to remember. The user will say whether it is a word or a phrase. Return only valid JSON with two keys: phrase and explanation. Example: {"phrase":"vendetta","explanation":"A word for a long-held grudge or revenge."}. Do not include any extra text or markdown.`;
  const userMessage = `Type: ${body.type}. Description: ${body.description}.`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 120,
      top_p: 0.95,
    }),
  }).catch((error) => {
    return null;
  });

  if (!response) {
    return NextResponse.json(
      { error: "Failed to reach OpenRouter." },
      { status: 500 },
    );
  }

  const rawText = await response.text();
  if (!response.ok) {
    return NextResponse.json(
      { error: `OpenRouter error ${response.status}: ${rawText}` },
      { status: response.status },
    );
  }

  const parsed = await parseJsonContent(rawText);
  if (!parsed?.phrase) {
    return NextResponse.json(
      { error: "OpenRouter returned unexpected data.", raw: rawText },
      { status: 502 },
    );
  }

  return NextResponse.json({
    phrase: parsed.phrase,
    explanation: parsed.explanation || "",
  });
}
