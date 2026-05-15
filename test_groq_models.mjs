import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GROQ_API_KEY;
  const endpoint = `https://api.groq.com/openai/v1/models`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      }
    });
    
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Models:", data.data.map(m => m.id));
  } catch (e) {
    console.log("Fetch Error:", e);
  }
}

test();
