const axios = require('axios');
axios.post('http://localhost:5000/api/playground/execute', {
  code: 'print("Hello world")',
  language: 'python'
})
.then(res => console.log("SUCCESS:", JSON.stringify(res.data, null, 2)))
.catch(err => console.error("ERROR:", err.response ? err.response.data : err.message));
