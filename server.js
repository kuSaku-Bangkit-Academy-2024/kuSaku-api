const express = require('express');
require('dotenv').config();
const app = express();
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const adviceRoutes = require('./src/routes/adviceRoutes');
const suggestRoutes = require('./src/routes/suggestRoutes');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/wallets', walletRoutes);
app.use('/advices', adviceRoutes);
app.use('/suggests', suggestRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
