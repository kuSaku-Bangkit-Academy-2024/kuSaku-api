const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');

exports.getAdvicesMonth = async (userId) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  
  const advicesRef = await db.collection('users').doc(userId).collection('advices').orderBy('timestamp', 'desc').limit(1).get();

  let data = [];
  advicesRef.forEach(doc => {
    data.push(doc.data());
  });

  let advices = [];
  if(data.length === 0){
    advices.push("You don't have any advice yet.");
  } else {
    data[0].advices.forEach(advice => advices.push(advice));
  }

  return { advices }
};

exports.addAdvicesDummy = async () => {
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
}