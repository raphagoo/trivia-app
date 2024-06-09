import axios from 'axios';

axios({
  method: 'get',
  url: 'http://localhost:3000/room',
  headers: { 'Content-Type': 'application/json' },
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Request failed:', error.response.data);
});
