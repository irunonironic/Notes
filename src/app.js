// src/app.js
import express from 'express';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

// Health-check / root route
app.get('/', (_, res) => {
  res.json({ status: 'Notes API is alive' });
});

// Mount route groups
app.use('/auth', authRoutes);   // /auth/register, /auth/login, /auth/me
app.use('/notes', notesRoutes); // /notes CRUD, protected by auth middleware
console.log('NOTES ROUTES MOUNTED'); // debug log

export default app;
