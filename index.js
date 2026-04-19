import fetch from "node-fetch";
import { encode } from "@toon-format/toon";
import users from "./users.json" with { type: "json" };

console.log(users);

async function runExample() {
    const toonData = encode(users);
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: `who is Arindam:\n${toonData}`,
        stream: false
      })
    });

    const data = await response.json();

    console.log("\nAI Response:\n", data.response);

    // Approx token usage
    const tokens = Math.ceil(data.response.length / 4);

    console.log("\nToken Usage (approx):");
    console.log("Completion Tokens:", tokens);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

runExample();