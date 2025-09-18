// Sanitizing input to protect application from malicious code
function sanitizeInputAdv(input) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>'""]/g, "") // Removes potential dangerous characters
    .replace(/script/gi, "") // Removes the word "script"
    .replace(/\s+/g, " ") // collapse whitespace
    .slice(0, 250) // Limit length to 250 characters
    .trim();
};

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

function createAvatar(name) {
  const initials = getInitials(name);
  const colors = [
    "#e57373", "#f06292", "#ba68c8", "#9575cd", "#7986cb",
    "#64b5f6", "#4fc3f7", "#4dd0e1", "#4db6ac", "#81c784",
    "#aed581", "#dce775", "#fff176", "#ffd54f", "#ffb74d",
    "#ff8a65", "#a1887f", "#e0e0e0", "#90a4ae"
  ];//NOTE - Deterministic color
  const charCodeSum = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  const color = colors[charCodeSum % colors.length]; 

  // Create SVG avatar as a data URL

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="${color}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="40" fill="#000">
        ${initials}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}


export { sanitizeInputAdv, getInitials, createAvatar };
