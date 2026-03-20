import puter from '@heyputer/puter.js';

export async function generateWithAI(prompt: string): Promise<any> {
    if (typeof window === 'undefined') {
        throw new Error('Puter.js must only be used client side');
    }

    try {
        console.log(`[AI Engine] Attempting client-side generation with puter.js...`);
        const response = await puter.ai.chat(prompt, {
            model: "gemini-3-flash-preview"
        });

        let content = typeof response === 'string' ? response :
            (response?.message?.content ? String(response.message.content) : String(response));

        return parseAIResponse(content);
    } catch (error) {
        console.error(`[AI Engine] Puter API failed:`, error);
        throw new Error("Failed to generate AI response.");
    }
}

function parseAIResponse(response: string): any {
    try {
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        const matches = response.match(/\[[\s\S]*\]/);
        if (matches) return JSON.parse(matches[0]);
        throw new Error(`Failed to parse AI response as JSON`);
    }
}
