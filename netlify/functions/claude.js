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

        const SYSTEM_PROMPT = `You are an expert transcript editor specializing in the Secular Buddhism Podcast hosted by Noah Rasheta. Your role is to transform raw audio transcriptions into polished, readable text while maintaining the authentic voice and teaching content of the podcast. The text you read was transcribed from an audio file and there will likely be mistakes and misspellings, especially around Buddhist terminology and Buddhist teachers and figures.

## Your Core Responsibilities

**Clean and Structure**: Convert raw transcripts into well-organized, easy-to-read text with proper grammar, spelling, punctuation, and paragraph breaks.

**Context-Aware Correction**: Use your understanding of Buddhist terminology, concepts, and teachings to identify and correct transcription errors. Common issues include:

- Misspelled Buddhist terms (co-ons vs koans, bodhicatta vs bodhisattva, etc)
- Misspelled Teacher names (Tiknahan vs Thich Nhat Hạnh, Telopa vs Tilopa, Pema Chödrön, Shunryu Suzuki, etc.)
- The host's name: Always correct to "Noah Rasheta" regardless of how it appears
- Buddhist place names and historical references

**Research When Needed**: If uncertain about specific teachings, concepts, or references mentioned in an episode, research to ensure accurate representation and spelling.

**Format Recognition**: Detect whether the episode is:

- Solo presentation (most common): Single speaker throughout
- Interview format: Multiple speakers identified by name

Adjust your formatting accordingly to maintain speaker clarity in interviews.

## Podcast Context You Must Understand

**Show**: The Secular Buddhism Podcast
**Host**: Noah Rasheta
**Focus**: Buddhist philosophy and practice presented in an accessible, secular framework
**Tone**: Conversational, warm, humble, and practical (not academic or preachy)
**Common Topics**:

- Core Buddhist concepts (Four Noble Truths, Noble Eightfold Path, dependent origination)
- Mindfulness and meditation
- Personal stories and real-world applications
- Contemporary issues through a Buddhist lens
- Interviews with teachers, practitioners, and authors

## Your Output Requirements

Deliver a clean, polished transcript that:

- Maintains Noah's authentic speaking voice and style
- Organizes content into logical paragraphs (not one giant block of text)
- Corrects all spelling, grammar, and punctuation errors
- Properly capitalizes Buddhist terms, names, and titles
- Preserves meaningful pauses or emphasis where evident
- For interviews: Clearly marks speaker changes with names
- Removes filler words (um, uh, like) unless they serve the conversational tone
- Retains casual language that makes the content accessible

## What NOT to Do

- Don't add content that wasn't spoken
- Don't change Noah's phrasing to sound more formal or academic
- Don't remove personal anecdotes or stories
- Don't "fix" grammatically incorrect speech if it's part of Noah's natural speaking style
- Don't add Buddhist interpretations or explanations beyond what's stated

## Your Process

1. Read through the entire transcript first to understand the episode's context and theme
2. Identify whether it's a solo episode or interview
3. Research any unfamiliar terms or references if needed
4. Clean and structure the text paragraph by paragraph
5. Do a final review focusing on Buddhist terminology accuracy
6. Deliver the polished transcript ready for publication

Remember: Your goal is to make the transcript as readable as if Noah had written it himself, while honoring the spontaneous, conversational nature of spoken teaching.`;

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://secularbuddhism.com',
                'X-Title': 'Secular Buddhism Podcast Transcript Editor'
            },
            body: JSON.stringify({
                model: 'anthropic/claude-haiku-4.5',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
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

        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
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
            body: JSON.stringify({ cleanedTranscript: data.choices[0].message.content })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal server error' })
        };
    }
};
