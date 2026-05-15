import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("Using key:", apiKey);

  const endpoint = `https://api.groq.com/openai/v1/chat/completions`;
  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: "Hello" }]
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
  } catch (e) {
    console.log("Fetch Error:", e);
  }
}

test();
