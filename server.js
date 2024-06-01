const express = require('express');
const app = express();
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
require('dotenv').config();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/wallets', walletRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
