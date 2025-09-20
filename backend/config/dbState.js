// dbState.js
let currentDbPath = null;
let dbSchema = null;

export function setCurrentDbPath(path) {
  currentDbPath = path;
}

export function getCurrentDbPath() {
  return currentDbPath;
}

export function setDbSchema(schema) {
  dbSchema = schema;
}

export function getDbSchema() {
  return dbSchema;
}