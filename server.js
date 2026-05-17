// Load API key from .env file
require('dotenv').config();

// Get Painless
const painless = require('./index');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Cleanup AI logic
painless.link('/api/analyze', async (data, res) => {
    try {
        const rawBase64String = data.image; // Expects {"image": "data:image/jpeg;base64,... "}

        if (!rawBase64String) {
            return res.send({ success: false, error: "No image payload supplied." });
        } // <-- Fixed: Added missing closing brace for the 'if' block
        
        console.log("System processing...");

        // Safety Filter: Strip off the browser data url header if present
        const matches = rawBase64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        let mimeType = "image/jpeg"; 
        let cleanBase64Data = rawBase64String;

        if (matches && matches.length === 3) {
            mimeType = matches[1];       
            cleanBase64Data = matches[2]; 
        }

        if (!matches) {
        cleanBase64Data = rawBase64String.replace(/^data:image\/\w+;base64,/, "");
        mimeType = "image/jpeg"; // Force tell Gemini it's a standard picture structure
         }

        // Fire the prompt and image data to Gemini's native multimodal model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: cleanBase64Data
                    }
                },
                "You are an expert cleaning coordinator. Analyze this visual of a room or space. List the main messy issues seen, and then output a crisp, numbered step-by-step sequential cleanup action plan."
            ]
        });

        // Extract the generated response string
        const cleanupGuideText = response.text;

        // Echo back cleanly
        res.send({
            success: true,
            steps: cleanupGuideText
        });

    } catch (error) { // <-- Fixed: The try block now correctly ends right before this catch
        console.error("Gemini Vision processing crashed:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: "Failed to read image layout." }));
    }
});

painless.link('api/analyze', painless.routes['/api/analyze']);

// Start the server
painless.start(5000);
