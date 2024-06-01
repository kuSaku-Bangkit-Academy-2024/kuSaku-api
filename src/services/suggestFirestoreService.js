const { Firestore } = require('@google-cloud/firestore');

exports.getSuggests = async (userId) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  
  const suggestsRef = await db.collection('users').doc(userId).collection('suggests').limit(0).get();

  let data = [];
  let suggests = []

  suggestsRef.forEach(doc => {
    data.push(doc.data());
  });

  if(data.length === 0){
    suggests.push("You don't have any suggest yet.");
  } else {
    data[0].suggests.forEach(suggest => data.push(suggest));
  }

  return { suggests }
};
