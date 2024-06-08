const express = require('express');
require('dotenv').config();
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const adviceRoutes = require('./src/routes/adviceRoutes');
const suggestRoutes = require('./src/routes/suggestRoutes');
const { loadModel } = require('./src/services/modelCategorizeService');

const app = express();
app.use(express.json());

const initializeServer = async () => {
  try {
    // const model = await loadModel();
    // app.locals.model = model;  // Store model in app.locals for access in routes

    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/wallets', walletRoutes);
    app.use('/advices', adviceRoutes);
    app.use('/suggests', suggestRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to load model:', error);
    process.exit(1); // Exit the process with an error code
  }
};

initializeServer();
