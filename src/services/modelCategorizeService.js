const axios = require('axios');

exports.getCategory = async (describe) => {
    const targetUrl = `http://${process.env.CATEGORIZE_URL}/predict`;
    const payload = { describe };

    const response = await axios.post(targetUrl, payload);
    return response.data.category;
}