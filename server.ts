import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Google GenAI client lazily or with process.env.GEMINI_API_KEY
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", name: "GOD GPT Server" });
});

// Chat API endpoint (Fallback when no client-side API key is provided or on failover)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], model = "GOD GPT Ultra", systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message prompt is required." });
    }

    const ai = getGenAI();

    // Map GOD GPT model name to Gemini model alias
    let geminiModel = "gemini-3.6-flash";
    if (model.includes("Pro") || model.includes("Claude") || model.includes("DeepSeek")) {
      geminiModel = "gemini-3.1-pro-preview";
    }

    // Format chat contents
    const contents: any[] = [];

    // System instruction preamble
    const defaultSysInstruction =
      "You are GOD GPT, an elite, highly intelligent, helpful, friendly, and elegant AI assistant built by PreatomYT. Provide detailed, insightful, clear, and nicely formatted Markdown responses with clean code blocks when relevant.";

    // Add previous history turns
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((msg: { role: string; content: string }) => {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }
      });
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let response;
    let actualModelUsed = geminiModel;

    try {
      response = await ai.models.generateContent({
        model: geminiModel,
        contents,
        config: {
          systemInstruction: systemInstruction || defaultSysInstruction,
          temperature: 0.7,
        },
      });
    } catch (modelError: any) {
      const errStr = String(modelError?.message || modelError || "");
      // Fallback to gemini-3.6-flash if primary model hit quota limit (429 / RESOURCE_EXHAUSTED)
      if (geminiModel !== "gemini-3.6-flash" && (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota"))) {
        console.warn(`Model ${geminiModel} hit quota limit. Automatically falling back to gemini-3.6-flash...`);
        actualModelUsed = "gemini-3.6-flash";
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction: systemInstruction || defaultSysInstruction,
            temperature: 0.7,
          },
        });
      } else {
        throw modelError;
      }
    }

    const replyText = response.text || "No response received from AI model.";
    return res.json({ reply: replyText, modelUsed: actualModelUsed });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const errMsg = error?.message || "";
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
      return res.status(429).json({
        error: "Rate limit exceeded for this model. Please wait a moment and try again.",
      });
    }
    return res.status(500).json({
      error: errMsg || "Failed to generate AI response.",
    });
  }
});

// Image Generation API endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, model = "GOD Vision", aspectRatio = "1:1" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGenAI();
    const imageModel = "gemini-3.1-flash-lite-image";

    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
        },
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      // Fallback placeholder image with prompt seed if model output had no inline data
      const encoded = encodeURIComponent(prompt);
      imageUrl = `https://picsum.photos/seed/${encoded.slice(0, 10)}/1024/1024`;
    }

    return res.json({ imageUrl, prompt });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate image.",
    });
  }
});

// Start Vite middleware or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GOD GPT Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
