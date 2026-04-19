import fetch from "node-fetch";
import users from "./users.json" with { type: "json" };
import { encode } from "@toon-format/toon";
import { encoding_for_model } from "@dqbd/tiktoken";

// Tokenizer (GPT-4 compatible)
const enc = encoding_for_model("gpt-4");

// Get CLI prompt
const userPrompt = process.argv.slice(2).join(" ");

async function run() {
  try {
    if (!userPrompt) {
      console.log("❌ Please provide a prompt");
      console.log('👉 Example: node toonApp.js "Summarize all users"');
      return;
    }

    // Convert JSON → TOON
    const toonData = encode(users);

    // Build input text
    const inputText = `
${userPrompt}

This is TOON formatted data (key-value style):
${toonData}
`;

console.log("📦 TOON Input Data:", toonData);
    // Call Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: inputText,
        stream: false
      })
    });

    const data = await response.json();
    const outputText = data.response;

    // 🔥 Token calculation
    const prompt_tokens = enc.encode(inputText).length;
    const completion_tokens = enc.encode(outputText).length;
    const total_tokens = prompt_tokens + completion_tokens;

    // ✅ Output (OpenAI style)
    console.log("\n==============================");
    console.log("📦 TOON Input Length:", toonData.length);
    console.log("==============================\n");

    console.log("🤖 Response:\n", outputText);

    console.log("\n📊 Token Usage:");
    console.log("prompt_tokens:", prompt_tokens);
    console.log("completion_tokens:", completion_tokens);
    console.log("total_tokens:", total_tokens);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

run();