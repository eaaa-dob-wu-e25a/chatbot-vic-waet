// window.addEventListener("DOMContentLoaded", getResponses);
async function getResponses() {
  const res = await fetch(responses_api);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  const data = await res.json();
  console.log(data);
}
