"use client";

import { useState } from "react";

export default function Home() {
  const [type, setType] = useState("word");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!description.trim()) {
      setError(
        "Please describe what you remember so WTP can generate a better suggestion.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to reach the API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">WTP</p>
        <h1>Find the word or phrase you can’t quite remember.</h1>
        <p className="subtitle">
          Describe the idea, feeling, or movie moment and WTP will suggest the
          closest match.
        </p>
      </section>

      <section className="card">
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <span className="field-label">This is a</span>
            <label
              className={`choice ${type === "word" ? "choice--active" : ""}`}
            >
              <input
                type="radio"
                name="type"
                value="word"
                checked={type === "word"}
                onChange={() => setType("word")}
              />
              <span>Word</span>
            </label>
            <label
              className={`choice ${type === "phrase" ? "choice--active" : ""}`}
            >
              <input
                type="radio"
                name="type"
                value="phrase"
                checked={type === "phrase"}
                onChange={() => setType("phrase")}
              />
              <span>Phrase</span>
            </label>
          </div>

          <div className="field-group">
            <label htmlFor="description">Describe your word</label>
            <textarea
              id="description"
              rows="6"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="It means “having resentment” towards another. I remember it was from a movie with a character wearing a Guy Fawkes mask."
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Finding…" : "Find it"}
          </button>
        </form>
      </section>

      {error ? (
        <section className="result-card result-card--error">
          <p className="result-label">Something went wrong</p>
          <p className="result-detail">{error}</p>
        </section>
      ) : null}

      {result ? (
        <section className="result-card">
          <div className="result-header">
            <p className="result-label">WTP suggests</p>
            <h2>{result.phrase}</h2>
          </div>
          <p className="result-detail">{result.explanation}</p>
          <p className="hint-text">
            If this looks right, great. If not, add more context and try again.
          </p>
        </section>
      ) : null}
    </main>
  );
}
