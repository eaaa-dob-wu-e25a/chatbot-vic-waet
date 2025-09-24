export default function userAvatars(name) {
  // Avatar API

  const base = "https://avatar.iran.liara.run";
  return {
    boy: `${base}/public/boy`,
    girl: `${base}/public/girl`,
    initials: `${base}/username?username=${encodeURIComponent(name || "user")}`,
  };

  // Boys: https://avatar.iran.liara.run/public/boy
  // Girls: https://avatar.iran.liara.run/public/girl
  // Initials: https://avatar.iran.liara.run/username?username=[firstname+lastname]
}
