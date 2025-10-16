import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export const options = {
  stages: [
    { duration: '60s', target: 200 }, 
    { duration: '1m', target: 200 },
    { duration: '30s', target: 18000 }, 
    { duration: '1m', target: 250 }, 
    {duration: '30s', target: 0 },
    ],
};

export default function () {
    const res = http.get('https://thankful-bay-039b7071e.2.azurestaticapps.net/menu.html');
    check(res, { 'status was 200': (r) => r.status === 200 });
    sleep(1);
}