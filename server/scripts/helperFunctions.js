// Sanitizing input to protect application from malicious code
function sanitizeInputAdv(input) {
  if (typeof input !== "string") return "";

  return input
    .normalize("NFC")
    .replace(/[<>'""]/g, "") // Removes potential dangerous characters
    .replace(/script/gi, "") // Removes the word "script"
    .replace(/\s+/g, " ") // collapse whitespace
    .slice(0, 250) // Limit length to 250 characters
    .trim();
}

function getInitials(name) {
  if (typeof name !== "string" || name.trim() === "") return "";
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return (
      words[0].charAt(0).toUpperCase() +
      words[words.length - 1].charAt(0).toUpperCase()
    );
  }
}

function createAvatar(name = "user") {
  const initials = getInitials(name);
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  // Create SVG avatar as a data URL
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="80" height="80" fill="hsl(${hue} 60% 50%)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="40" fill="#202020ff">
        ${initials}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}




export { sanitizeInputAdv, getInitials, createAvatar };
