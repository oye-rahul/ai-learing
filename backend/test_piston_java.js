const axios = require('axios');
axios.post('http://localhost:5000/api/playground/execute', {
  code: 'public class Main { public static void main(String[] args) { System.out.println("Hello world java"); } }',
  language: 'java'
})
.then(res => console.log("SUCCESS:", JSON.stringify(res.data, null, 2)))
.catch(err => console.error("ERROR:", err.response ? err.response.data : err.message));
