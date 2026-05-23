# WTP AI

A simple Next.js App Router project that helps users remember a word or phrase by describing it.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your OpenRouter API key to `.env`:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. Run the app locally:

   ```bash
   npm run dev
   ```

## Deployment

Deploy to Vercel normally. The app uses the `/api/generate` route to call OpenRouter from the server.
