export async function sendEmailRequest(templateType, to, data) {
  const response = await fetch('http://localhost:3001/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateType, to, data }),
  });
  return response.json();
}