import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const chatbot = async (req, res) => {
  try {
    console.log("Groq Key Exists:", !!process.env.GROQ_API_KEY);

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI farming assistant. Help farmers with crop diseases, fertilizers, irrigation, weather impacts, pest control, and sustainable agriculture practices.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Groq Error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};