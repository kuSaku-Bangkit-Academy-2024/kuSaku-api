exports.getAdvicesMonth = async (userId) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  
  const advicesRef = await db.collection('users').doc(userId).collection('advices').orderBy('timestamp', 'desc').limit(1).get();

  let data = [];
  let advices = [];
  advicesRef.forEach(doc => {
    data.push(doc.data());
  });

  if(data.length === 0){
    advices.push("You don't have any advice yet.");
  } else {
    data[0].advices.forEach(advice => data.push(advice));
  }

  return { advices }
};
