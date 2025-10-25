# Podcast Transcript Editor

A web application that uses Claude AI (Haiku 4.5) to clean and organize podcast transcripts into well-formatted markdown documents.

## Features

- Upload raw podcast transcript files (txt, md, doc, docx)
- Automatic cleaning and formatting using Claude AI
- Removes filler words and verbal tics
- Fixes grammar and punctuation
- Identifies and labels speakers
- Structures content with markdown headings
- Download cleaned transcript as markdown file
- API key stored securely in browser localStorage

## Setup

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

1. Enter your Claude API key (get one from https://console.anthropic.com/)
2. Upload a podcast transcript file
3. Click "Process Transcript"
4. Wait for Claude to clean and format the content
5. Download the cleaned markdown file

## Development

For development with auto-reload:
```bash
npm run dev
```

## Technical Details

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js with Express
- **AI Model:** Claude 3.5 Haiku (claude-3-5-haiku-20241022)
- **API:** Anthropic Claude API

## Architecture

The app uses a proxy server to handle Claude API requests (to avoid CORS issues):

```
Browser (app.js) → Express Server (server.js) → Claude API
```

Your API key is sent from the browser to the server, which then makes the request to Claude on your behalf.

## Security Note

Your API key is stored in browser localStorage for convenience. The key is only sent to your local server and then to Claude API. Never share your API key or commit it to version control.
