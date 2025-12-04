import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(200).json({ message: "ChatGPT Clone API" });
    }

    const userPrompt = req.body.prompt;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: userPrompt }]
        })
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
}
