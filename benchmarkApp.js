import fetch from "node-fetch";
import users from "./users.json" with { type: "json" };
import { encode } from "@toon-format/toon";
import { encoding_for_model } from "@dqbd/tiktoken";

const enc = encoding_for_model("gpt-4");

// 🔥 Multiple prompts to test
const prompts = [
  "Summarize all users in 2 lines",
  "List users with more than 3 years experience",
  "Find users from Mumbai",
  "Count how many developers are there",
  "List all roles in the data"
];

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

function getStats(inputText, outputText) {
  const prompt_tokens = enc.encode(inputText).length;
  const completion_tokens = enc.encode(outputText).length;
  return {
    prompt_tokens,
    completion_tokens,
    total_tokens: prompt_tokens + completion_tokens
  };
}

async function runBenchmark() {
  let totalJSON = 0;
  let totalTOON = 0;

  const jsonString = JSON.stringify(users);
  const toonData = encode(users);

  console.log("\n🚀 BENCHMARK STARTED...\n");

 for (const prompt of prompts) {
  console.log("=======================================");
  console.log("🧠 Prompt:", prompt);

  // ===== JSON =====
  const jsonInput = `${prompt}\n\nData:\n${jsonString}`;
  const jsonRes = await callOllama(jsonInput);
  const jsonStats = getStats(jsonInput, jsonRes);

  // ===== TOON =====
  const toonInput = `${prompt}\n\nTOON Data:\n${toonData}`;
  const toonRes = await callOllama(toonInput);
  const toonStats = getStats(toonInput, toonRes);

  totalJSON += jsonStats.total_tokens;
  totalTOON += toonStats.total_tokens;

  const diff = jsonStats.total_tokens - toonStats.total_tokens;
  const percent = ((diff / jsonStats.total_tokens) * 100).toFixed(2);

  // 📦 Input size
  console.log("\n📦 Input Length:");
  console.log("JSON:", jsonString.length, "| TOON:", toonData.length);

  // 📊 Tokens
  console.log("\n📊 Tokens:");
  console.log("JSON:", jsonStats.total_tokens);
  console.log("TOON:", toonStats.total_tokens);

  // 🤖 OUTPUTS (NEW 🔥)
  console.log("\n🤖 JSON Response:\n");
  console.log(jsonRes);

  console.log("\n🤖 TOON Response:\n");
  console.log(toonRes);

  // 🚀 Comparison
  console.log("\n🚀 Comparison:");
  if (diff > 0) {
    console.log(`✅ TOON saved ${diff} tokens (${percent}%)`);
  } else {
    console.log(`❌ TOON used more ${Math.abs(diff)} tokens (${Math.abs(percent)}%)`);
  }

  console.log("=======================================\n");
}

  // 🔥 FINAL RESULT
  const totalDiff = totalJSON - totalTOON;
  const avgPercent = ((totalDiff / totalJSON) * 100).toFixed(2);

  console.log("\n🔥 FINAL SUMMARY 🔥");
  console.log("Total JSON Tokens:", totalJSON);
  console.log("Total TOON Tokens:", totalTOON);

  if (totalDiff > 0) {
    console.log(`🚀 Overall TOON saved ${totalDiff} tokens (${avgPercent}%)`);
  } else {
    console.log(`⚠️ Overall TOON used MORE tokens by ${Math.abs(totalDiff)} (${Math.abs(avgPercent)}%)`);
  }

  console.log("\n✅ Benchmark completed!\n");
}

runBenchmark();