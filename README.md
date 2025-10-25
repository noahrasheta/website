# Podcast Transcript Editor

A web application that uses Claude AI (Haiku 4.5) to clean and organize podcast transcripts into well-formatted markdown documents.

## Features

- Upload raw podcast transcript files (txt, md, docx)
- Automatic cleaning and formatting using Claude AI via OpenRouter
- Removes filler words and verbal tics
- Fixes grammar and punctuation
- Identifies and labels speakers
- Structures content with markdown headings
- Download cleaned transcript as markdown file
- API key stored securely in browser localStorage

## Setup

### Option 1: Deploy to Netlify (Recommended for Public Access)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy the site:**
   ```bash
   netlify deploy --prod
   ```

4. Follow the prompts:
   - Create a new site or link to existing
   - Set publish directory to `.` (current directory)
   - The site will be deployed to a Netlify URL

### Option 2: Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:3000`

## Usage

1. Enter your OpenRouter API key (get one from https://openrouter.ai/keys)
2. Upload a podcast transcript file
3. Click "Process Transcript"
4. Wait for Claude to clean and format the content via OpenRouter
5. Download the cleaned markdown file

## Development

For development with auto-reload:
```bash
npm run dev
```

## Technical Details

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Netlify Serverless Functions
- **AI Model:** Claude 3.5 Haiku (anthropic/claude-3.5-haiku)
- **API:** OpenRouter API (accessing Claude models)

## Architecture

The app uses a Netlify serverless function to handle OpenRouter API requests (to avoid CORS issues):

```
Browser (app.js) → Netlify Function (claude.js) → OpenRouter API → Claude Model
```

Your API key is sent from the browser to the Netlify function, which then makes the request to OpenRouter on your behalf.

## Security Note

Your API key is stored in browser localStorage for convenience. The key is only sent to the Netlify function and then to OpenRouter API. Never share your API key or commit it to version control.
