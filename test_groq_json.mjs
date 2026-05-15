import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GROQ_API_KEY;

  const endpoint = `https://api.groq.com/openai/v1/chat/completions`;
  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You must output JSON." },
      { role: "user", content: "Hello" }
    ],
    response_format: { type: "json_object" }
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
