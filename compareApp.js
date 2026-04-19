import fetch from "node-fetch";
import users from "./users.json" with { type: "json" };
import { encode } from "@toon-format/toon";
import { encoding_for_model } from "@dqbd/tiktoken";

const enc = encoding_for_model("gpt-4");

// CLI prompt
const userPrompt = process.argv.slice(2).join(" ");

async function callOllama(inputText) {
  const res = await fetch("http://localhost:11434/api/generate", {
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

  const data = await res.json();
  return data.response;
}

function getTokenStats(inputText, outputText) {
  const prompt_tokens = enc.encode(inputText).length;
  const completion_tokens = enc.encode(outputText).length;
  const total_tokens = prompt_tokens + completion_tokens;

  return { prompt_tokens, completion_tokens, total_tokens };
}

async function run() {
  if (!userPrompt) {
    console.log("❌ Please provide a prompt");
    console.log('👉 Example: node compareApp.js "Summarize all users"');
    return;
  }

  // ===== JSON =====
  const jsonString = JSON.stringify(users);
  const jsonInput = `${userPrompt}\n\nData:\n${jsonString}`;

  const jsonResponse = await callOllama(jsonInput);
  const jsonStats = getTokenStats(jsonInput, jsonResponse);

  // ===== TOON =====
  const toonData = encode(users);
  const toonInput = `${userPrompt}\n\nTOON Data:\n${toonData}`;

  const toonResponse = await callOllama(toonInput);
  const toonStats = getTokenStats(toonInput, toonResponse);

  // ===== OUTPUT =====
  console.log("\n================ 🔥 COMPARISON =================\n");

  console.log("📦 JSON Input Length:", jsonString.length);
  console.log("📦 TOON Input Length:", toonData.length);

  console.log("\n📊 TOKEN USAGE");
  console.log("------------ JSON ------------");
  console.log(jsonStats);

  console.log("\n------------ TOON ------------");
  console.log(toonStats);

  // ===== SAVINGS =====
  const savedTokens = jsonStats.total_tokens - toonStats.total_tokens;
  const percent = ((savedTokens / jsonStats.total_tokens) * 100).toFixed(2);

  console.log("\n🚀 RESULT:");
  if (savedTokens > 0) {
    console.log(`TOON saves ${savedTokens} tokens (${percent}%)`);
  } else {
    console.log(`TOON uses MORE tokens by ${Math.abs(savedTokens)} (${Math.abs(percent)}%)`);
  }

  console.log("\n==============================\n");

  // Optional: show responses
  console.log("🤖 JSON Response:\n", jsonResponse);
  console.log("\n🤖 TOON Response:\n", toonResponse);
}

run();