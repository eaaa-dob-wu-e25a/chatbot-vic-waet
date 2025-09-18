export async function fetchMessages(api) {
  try {
      const response = await fetch(api);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  } catch (err) {
    console.error(`Error fetching ${api}:`, err);
    return null;
  }
}
