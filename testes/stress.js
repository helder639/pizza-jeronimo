import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '60s', target: 200 }, //200 usuarios em 1 min
    { duration: '4m', target: 200 }, //deixar os 200 usuarios por 4 min
    {duration: '30s', target: 0 },
    ],
};

export default function () {
    const res = http.get('https://thankful-bay-039b7071e.2.azurestaticapps.net/menu.html');
    check(res, { 'status was 200': (r) => r.status === 200 });
    sleep(1);
}