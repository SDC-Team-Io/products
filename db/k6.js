import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 1 },
    { duration: '10s', target: 1000 },
    { duration: '5s', target: 0 },
  ],
}

export default function() {
  const product = Math.floor(Math.random() * 1000011);
  http.get(`http://54.202.83.82:3000/products/${product}`);
  sleep(1);
}
