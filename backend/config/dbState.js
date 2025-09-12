// dbState.js
let currentDbPath = null;

export function setCurrentDbPath(path) {
  currentDbPath = path;
}

export function getCurrentDbPath() {
  return currentDbPath;
}