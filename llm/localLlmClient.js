import fetch from 'node-fetch';

export async function callLLM(prompt) {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral',
      prompt,
      stream: false,
      temperature: 0.2
    })
  });

  const data = await res.json();
  return data.response;
}

export async function callLocalLLM(prompt) {
  return await callLLM(prompt);
}
