export function getAuth() {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const isGuest = auth.isGuest === true || localStorage.getItem("X_GUEST") === "1";
  return { isGuest };
}
