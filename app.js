import queryRoutes from './backend/routes/queryRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';
import historyRoutes from './backend/routes/historyRoutes.js';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './backend/middleware/db.js';
import express from 'express';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/queries', queryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);

// Connect to the database when the server starts
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Gracefully disconnect from the database on server shutdown
