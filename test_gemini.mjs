import 'dotenv/config';

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("NO API KEY in .env");
    return;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
  
  const body = {
    contents: [{ role: "user", parts: [{ text: "Hello, testing API" }] }]
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Body:", text);
}

test();
