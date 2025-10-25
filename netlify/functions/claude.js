exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { apiKey, transcriptContent } = JSON.parse(event.body);

        if (!apiKey || !transcriptContent) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Missing required fields: apiKey and transcriptContent'
                })
            };
        }

        const SYSTEM_PROMPT = `You are an expert podcast transcript editor. Your task is to clean and organize raw podcast transcripts into well-formatted, readable markdown documents.

When cleaning transcripts, you should:

1. **Remove filler words and verbal tics**: Remove excessive "um", "uh", "like", "you know", etc., while maintaining natural speech flow
2. **Fix grammar and punctuation**: Correct obvious grammatical errors and add proper punctuation
3. **Identify speakers**: Clearly label different speakers (e.g., "**Host:**", "**Guest:**")
4. **Structure the content**: Break the transcript into logical sections with descriptive headings
5. **Format for readability**: Use markdown formatting including:
   - Headings (##, ###) for sections
   - Bold for speaker names
   - Paragraph breaks for readability
   - Block quotes (>) for important quotes or key points
   - Lists where appropriate
6. **Preserve meaning**: Never change the meaning or intent of what was said
7. **Keep important context**: Maintain jokes, anecdotes, and conversational elements that add value
8. **Add timestamps**: If timestamps are present in the original, preserve them in format [HH:MM:SS]

Output the cleaned transcript in markdown format with a clear title at the top.`;

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 4096,
                system: SYSTEM_PROMPT,
                messages: [
                    {
                        role: 'user',
                        content: `Please clean and organize the following podcast transcript:\n\n${transcriptContent}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorMessage })
            };
        }

        const data = await response.json();

        if (!data.content || !data.content[0] || !data.content[0].text) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Unexpected API response format' })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cleanedTranscript: data.content[0].text })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal server error' })
        };
    }
};
