import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, 
    { duration: '30s', target: 300 }, 
    { duration: '30s', target: 400 },
    { duration: '30s', target: 600 }, 
    { duration: '30s', target: 1000 }, 
    { duration: '30s', target: 3000 }, 
    { duration: '30s', target: 4000 }, 
    { duration: '30s', target: 6000 },  
    ],
};

export default function () {
    const res = http.get('https://thankful-bay-039b7071e.2.azurestaticapps.net/menu.html');
    check(res, { 'status was 200': (r) => r.status === 200 });
    sleep(1);
}