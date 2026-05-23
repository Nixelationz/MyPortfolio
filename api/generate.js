async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "OpenRouter API key not configured." });
  }

  let body = req.body;
  if (!body || Object.keys(body).length === 0) {
    const raw = await getRawBody(req);
    try {
      body = JSON.parse(raw || "{}");
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }

  const { type, description } = body;
  if (!description || !type) {
    return res
      .status(400)
      .json({ error: "Request must include type and description." });
  }

  const prompt = `You are WTP, a helper that returns the exact word or phrase the user is trying to remember. The user will say whether it is a word or a phrase. Return only valid JSON with two keys: phrase and explanation. Example: {"phrase":"vendetta","explanation":"A word for a long-held grudge or revenge."}. Do not include any extra text or markdown.`;
  const userMessage = `Type: ${type}. Description: ${description}.`;

  try {
    const response = await fetch("https://openrouter.ai/v1/chat/completions", {
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
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    let parsed = null;
    try {
      parsed = JSON.parse(content.trim());
    } catch (error) {
      const jsonMatch = content.match(/\{[^\}]*\}/s);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          parsed = null;
        }
      }
    }

    if (!parsed?.phrase) {
      return res
        .status(502)
        .json({ error: "OpenRouter returned unexpected data.", raw: content });
    }

    return res
      .status(200)
      .json({ phrase: parsed.phrase, explanation: parsed.explanation ?? "" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to call OpenRouter.", details: error.message });
  }
};
