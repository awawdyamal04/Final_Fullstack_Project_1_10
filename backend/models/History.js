import mongoose from "mongoose";
const { Schema } = mongoose;

const historySchema = new Schema({
    userID: { type: String, required: true },
    prompt: { type: String, required: true },
    sql: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
export const History = mongoose.model('History', historySchema);