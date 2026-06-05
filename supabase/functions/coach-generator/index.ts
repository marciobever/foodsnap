
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { COACH_SYSTEM_PROMPT } from "./prompt.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { photos, goal, last_evaluation } = await req.json();

        if (!photos || (!photos.front && !photos.side && !photos.back)) {
            throw new Error("Pelo menos uma foto é necessária.");
        }

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("Servidor não configurado (API Key ausente).");
        }

        // Prepare Image Parts
        const parts = [];

        // System Prompt
        parts.push({ text: COACH_SYSTEM_PROMPT });

        // User Goal & History
        let userPrompt = `Objetivo do Usuário: ${goal}\n`;
        if (last_evaluation) {
            userPrompt += `\nHistórico (Última Avaliação do Usuário): ${last_evaluation}\nAnalise as fotos comparando o físico atual com esse histórico e explique as mudanças notadas.\n`;
        } else {
            userPrompt += `\nAnalise as fotos e gere o protocolo inicial.\n`;
        }
        parts.push({ text: userPrompt });

        // Images
        for (const [key, value] of Object.entries(photos)) {
            if (typeof value === 'string' && value.includes('base64,')) {
                // value example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
                const base64Data = value.split(',')[1];
                // Detect mime type
                const mimeMatch = value.match(/^data:(.*);base64/);
                const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

                parts.push({
                    inline_data: {
                        mime_type: mimeType,
                        data: base64Data
                    }
                });
            }
        }

        // Call Gemini API via Fetch (More stable than SDK in Deno Edge)
        // Using user-specified model: gemini-2.5-flash
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: {
                        temperature: 0.2,
                        response_mime_type: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Erro na IA (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error("Gemini Empty Response:", JSON.stringify(data));
            throw new Error("A IA não conseguiu analisar as imagens. Tente fotos com melhor iluminação.");
        }

        let jsonResponse;
        try {
            // Clean markdown blocks if present (common in Gemini responses)
            const cleaned = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleaned);
        } catch (e) {
            console.error("JSON Parse Error:", generatedText);
            throw new Error("Erro ao processar a resposta da IA. Tente novamente.");
        }

        // Basic validation of the response structure
        if (!jsonResponse.analysis || !jsonResponse.diet || !jsonResponse.workout) {
            throw new Error("A resposta da IA veio incompleta. Por favor, tente novamente.");
        }

        return new Response(JSON.stringify(jsonResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 // Return 400 so client sees it as error, but with body
        });
    }
});
