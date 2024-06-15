const { Firestore } = require('@google-cloud/firestore');

exports.monthlyTaskService = async () => {
    const db = new Firestore({
      databaseId: process.env.DATABASE
    });
    const now = new Date();
    now.setHours(now.getHours() - 7);

    const usersSnapshot = await db.collection('users').get();
      
    for (const userDoc of usersSnapshot.docs) {
      const walletSnapshot = await userDoc.ref.collection('wallet').get();
      const currentIncome = userDoc.income;

      const batch = db.batch();
      walletSnapshot.forEach(walletDoc => {
          const walletRef = walletDoc.ref;
          const updateIncome = currentIncome;
          batch.update(walletRef, { income: updateIncome, balance: updateIncome, totalExpenses: 0, updatedAt: Math.round(now.getTime() / 1000) });
      });

      await batch.commit();
    }
};
