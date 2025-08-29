import queryRoutes from './backend/routes/queryRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';
import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/queries', queryRoutes);
app.use('/api/ai', aiRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});