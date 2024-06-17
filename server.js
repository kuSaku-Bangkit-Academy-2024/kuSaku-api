const express = require('express');
require('dotenv').config();
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const adviceRoutes = require('./src/routes/adviceRoutes');
const suggestRoutes = require('./src/routes/suggestRoutes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/wallets', walletRoutes);
app.use('/advices', adviceRoutes);
app.use('/suggests', suggestRoutes);

// Temporary Route for add dummy data
const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('./src/middlewares/auth');
const responseHandler = require('./src/utils/responseHandler');

app.use('/temp/wallets/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    
    const walletDocRef = firestore.collection('users').doc(userId).collection('wallets').doc(userId);
    const walletDoc = await walletDocRef.get();
    const walletInfo = walletDoc.data();

    if (!walletInfo) {
        throw new Error('Wallet not found');
    }

    const cat = ['Other', 'Food', 'Education', 'Transportation', 'Household', 'Social Life', 'Apparel', 'Health', 'Entertainment'];
    
    for(let month = 3; month <= 5; month++){
        for(let date = 1; date <= 31; date++){
            const dateObj = new Date(2024, month, date);
            dateObj.setHours(dateObj.getHours() + 7);
            const expenseId = uuidv4();
            const expenseData = {
                expenseId,
                describe: `expenses number-${dateObj.getMonth()+1}-${dateObj.getDate()}`,
                price: parseInt(1000, 10),
                timestamp: Math.floor(dateObj.getTime() / 1000),
                category: cat[Math.floor(Math.random() * cat.length)]
            }
        
            if(month === 5){
                if(date > 15){
                    break;
                }
                // Calculate totalExpense after the new expense is added
                let totalExpense = walletInfo.totalExpense || 0;
                totalExpense += expenseData.price;
        
                // Calculate balance after the new expense is added
                let balance = walletInfo.balance || 0;
        
                if(totalExpense > balance){
                    throw new ClientError("Expense is bigger than balance", 409);
                }
        
                balance -= expenseData.price; // Subtract the expense price, not the total expense
        
                // Update the balance and totalExpense in the wallet document
                await walletDocRef.update({ balance: balance, totalExpense: totalExpense });
            }
            // Set the new expense data in the expenses sub-collection
            await walletDocRef.collection('expenses').doc(expenseId).set({...expenseData});
        }
    }
      
    responseHandler.success(res, {message: 'SUKSES MAS'});
  } catch (error) {
      responseHandler.error(res, error);
  }
})

app.use('/temp/advice/add', async (_req, res) => {
  try {
    const db = new Firestore({
      databaseId: process.env.DATABASE
    });
    const now = new Date();
    now.setHours(now.getHours() + 7);
  
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    const advices = [];
  
    for (let i = 1; i <= 10; i++){
      advices.push(`advice number-${i}`);
    }
    
    usersSnapshot.forEach(userDoc => {
        const adviceId = uuidv4();
        const userRef = db.collection('users').doc(userDoc.id);
        
        const adviceRef = userRef.collection('advices').doc(adviceId);
        
        batch.set(adviceRef, {
            advices,
            timestamp: now
        });
    });
    
    await batch.commit();

    responseHandler.success(res, {message: "SUKSES MAS"});
  } catch (error) {
    responseHandler.error(res, error);
  }
});

// end of temporary route

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
