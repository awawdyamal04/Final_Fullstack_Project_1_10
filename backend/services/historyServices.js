import { History } from "../models/History.js";

export async function getAllHistory() {
  return await History.find();
}

export async function getHistoryEntry(userID) {
  return await History.find({ userID }).sort({ timestamp: -1 });
}

export async function addHistoryEntry(userID, prompt, sql) {
  const newEntry = new History({ userID, prompt, sql });
  return await newEntry.save();
}

export async function updateHistoryEntry(historyID, userID, prompt, sql) {
  return await History.findOneAndUpdate(
    { _id: historyID, userID },
    { prompt, sql, timestamp: Date.now() },
    { new: true }
  );
}

export async function deleteHistoryEntry(historyID, userID) {
  const result = await History.deleteOne({ _id: historyID, userID });
  return result.deletedCount > 0;
}
