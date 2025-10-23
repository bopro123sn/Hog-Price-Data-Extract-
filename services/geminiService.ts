
import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedDataResponse } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        priceMovementSummary: {
            type: Type.STRING,
            description: "A concise, 2-3 sentence summary analyzing the hog price movements based on the article's content. It should describe the overall trend (e.g., stable, increasing, decreasing) and mention any specific reasons cited in the text."
        },
        extractedData: {
            type: Type.ARRAY,
            description: "An array of hog price records extracted from the text, with one entry for each province mentioned.",
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "The publication date of the price data, in YYYY-MM-DD format." },
                    province: { type: Type.STRING, description: "The province or region name in Vietnamese." },
                    price: {
                        type: Type.NUMBER,
                        description: "The average price in VND/kg, as a single number. This is calculated from the price range in the text. IMPORTANT: The AI must correctly interpret Vietnamese numbers where '.' is a thousands separator (e.g., '68.000' is 68000)."
                    },
                },
                required: ["date", "province", "price"]
            }
        }
    },
    required: ["extractedData", "priceMovementSummary"]
};


const getPrompt = (content: string, contentType: 'html' | 'text'): string => {
    const commonInstructions = `
        Your first task is to provide a concise, 2-3 sentence summary of the hog price movements described in the article. This summary should capture the overall market trend (e.g., prices are generally stable, increasing, or decreasing) and mention any key reasons for the changes if the text provides them. This will be the 'priceMovementSummary'.

        Your second task is to extract the detailed data:
        1.  **Identify Date**: From the article content, find the publication date. Format it as YYYY-MM-DD. If the year is missing, assume the current year. This date should be the same for all records from this article.
        2.  **Identify Provinces and Prices**: Scan the article text and identify every Vietnamese province or region mentioned alongside its hog price.
        3.  **Handle Vietnamese Currency**: Prices are in Vietnamese Dong (VND) and use a period (.) as a thousands separator. For example, '68.000' MUST be interpreted as the number 68000.
        4.  **Calculate Average Price**: Most prices are given as a range (e.g., "68.000 - 69.000 đồng/kg"). You must calculate the average of this range. For example, the average of 68.000 and 69.000 is (68000 + 69000) / 2 = 68500. The final price must be a single number.
        5.  **Structure Data**: Create an array of JSON objects for the 'extractedData' field. Each object represents a province and must contain "date", "province", and the calculated average "price". Ensure every province found in the text is included.
        6.  **Final Output**: Return a single JSON object that strictly follows the provided response schema, containing both the 'priceMovementSummary' and the 'extractedData' array.
    `;

    if (contentType === 'html') {
        return `
            You are an expert data analyst specializing in agricultural markets in Vietnam.
            Your task is to analyze the provided HTML content, find the main article, and then extract hog price information and a market summary into a clean JSON format.

            From the HTML content below, please perform the following actions:
            First, parse the provided HTML to find the main news article body. Ignore all non-essential elements like headers, footers, navigation bars, advertisements, and sidebars. Focus only on the text that constitutes the article itself.
            Then, perform these two tasks:
            ${commonInstructions}

            Here is the full HTML content of the webpage:
            ---
            ${content}
            ---
        `;
    } else { // 'text'
        return `
            You are an expert data analyst specializing in agricultural markets in Vietnam.
            Your task is to analyze the provided article text and extract hog price information and a market summary into a clean JSON format.

            From the text below, please perform the following actions:
            ${commonInstructions}

            Here is the article text:
            ---
            ${content}
            ---
        `;
    }
};


export const extractHogPriceData = async (content: string, contentType: 'html' | 'text'): Promise<ExtractedDataResponse | null> => {
    const prompt = getPrompt(content, contentType);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // Basic validation
        if (parsedJson && (parsedJson.extractedData || parsedJson.priceMovementSummary)) {
            return parsedJson as ExtractedDataResponse;
        }
        return null;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to fetch or parse data from AI. The model may have returned an invalid format.");
    }
};