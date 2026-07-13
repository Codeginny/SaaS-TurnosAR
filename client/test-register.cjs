const axios = require('axios');

async function test() {
  try {
    console.log("Testing POST /api/patient-register");
    const res = await axios.post('http://localhost:3001/api/patient-register', {
      dni: '99887766',
      password: 'password123'
    });
    console.log("Response:", res.status, res.data);
  } catch (error) {
    if (error.response) {
      console.log("Error Response:", error.response.status, error.response.data);
    } else {
      console.log("Error Message:", error.message);
    }
  }
}

test();
