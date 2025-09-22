import { getHistoryEntry, addHistoryEntry, updateHistoryEntry, deleteHistoryEntry, getAllHistory } from '../services/historyServices.js';

export async function getHistory(req, res) {
  if (req.user?.isGuest) {
    return res.status(401).json({
      code: "LOGIN_REQUIRED",
      message: "Login to see history.",
    });
  }
  const history = await getAllHistory();
  res.status(200).json(history);
}

export async function getUserHistory(req, res) {
  try {
    if (req.user?.isGuest) {
      return res.status(401).json({
        code: "LOGIN_REQUIRED",
        message: "Login to see history.",
      });
    }
    
    const { userID } = req.params;
    if (!userID) {
      return res.status(400).json({ error: "userID is required" });
    }
    const history = await getHistoryEntry(userID);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
}

export async function saveHistory(req, res) {
    // אם אורח — לא שומרים היסטוריה. מריצים את השאילתא/פעולה כרגיל בצד שלך.
    if (req.user?.isGuest) {
        return res.status(204).send(); // "No Content" — לא נשמר
    }

    const { userID, prompt, sql, save } = req.body;
    
    // Check if the save is one of the allowed values (boolean or undefined for default)
    if (save !== undefined && typeof save !== 'boolean') {
        return res.status(400).json({ error: 'Invalid value for save. Must be true or false.' });
    }

    if (!userID) {
        return res.status(400).json({ error: 'userID is required' });
    }
    
    if (!prompt || !sql) {
        return res.status(400).json({ error: 'prompt and sql are required' });
    }
    try {
        if (save === false) {
            return res.status(200).json({ message: 'Entry not saved as per request' });
        }
        const newEntry = await addHistoryEntry(userID, prompt, sql);
        res.status(201).json(newEntry);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add history entry' });
    }
}

export async function updateHistory(req, res) {
    try {
        const {historyID} = req.params;
        const { userID, prompt, sql } = req.body;
        if (!historyID) {
            return res.status(400).json({ error: "historyID is required" });
        }
        if (!userID || !prompt || !sql) {
            return res.status(400).json({ error: "userID, prompt, and sql are required" });
        }

        const updatedEntry = await updateHistoryEntry(historyID, userID, prompt, sql);
        if (!updatedEntry) {
            return res.status(404).json({ error: "History entry not found for the provided user" });
        }
        res.status(200).json(updatedEntry);
    } 
    catch (err) {
        res.status(500).json({ error: "Failed to update history entry" });

    } 
}

export async function deleteHistory(req, res) {
    try {
        const {historyID} = req.params;
        const { userID } = req.body;
        if (!historyID || !userID) {
            return res.status(400).json({ error: "historyID and userID are required" });
        }
        const deleted = await deleteHistoryEntry(historyID, userID);
        if (!deleted) {
            return res.status(404).json({ error: "History entry not found for the provided user" });
        }
        res.status(200).json({ message: "History entry deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete history entry" });
    }
}