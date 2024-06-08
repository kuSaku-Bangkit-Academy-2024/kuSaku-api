// const tf = require('@tensorflow/tfjs-node');
// const ClientError = require('../utils/clientError');

// async function loadModel() {
//     console.log(process.env.MODEL_CATEGORIZE);
//     return tf.loadGraphModel(process.env.MODEL_CATEGORIZE);
// }
 
// const predictCategory = async (model, describe) => {
//     try {
//         const prediction = model.predict(describe);
//         const result = prediction.dataSync();
//         console.log(prediction);
//         console.log(result);
        
//         return result;
//     } catch (error) {
//         throw new ClientError(`Terjadi kesalahan input: ${error.message}`)
//     }
// }

// module.exports = {
//     loadModel,
//     predictCategory
// }