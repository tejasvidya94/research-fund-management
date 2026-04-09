require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
const authRoutes = require('./src/routes/auth.routes');
const projectRoutes = require('./src/routes/projects');
const equipmentRoutes = require('./src/routes/equipment.routes');
const projectAccountRoutes = require('./src/routes/projectAccounts');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/project-accounts', projectAccountRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database initialized`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});