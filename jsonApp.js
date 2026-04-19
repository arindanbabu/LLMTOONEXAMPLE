import fetch from "node-fetch";
import users from "./users.json" with { type: "json" };
import { countTokens } from "./tokenUtil.js";

const userPrompt = process.argv.slice(2).join(" ");

async function run() {
  if (!userPrompt) {
    console.log("❌ Please provide a prompt");
    return;
  }

  const inputText = `${userPrompt}\n\nData:\n${JSON.stringify(users)}`;

  console.log("📦 Input Data:", inputText);
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
  const prompt_tokens = countTokens(inputText);
  const completion_tokens = countTokens(outputText);
  const total_tokens = prompt_tokens + completion_tokens;

  // ✅ Output like OpenAI
  console.log("\nResponse:\n", outputText);
  console.log("\nprompt_tokens:", prompt_tokens);
  console.log("completion_tokens:", completion_tokens);
  console.log("total_tokens:", total_tokens);
}

run();