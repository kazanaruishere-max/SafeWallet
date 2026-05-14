import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    // 1. Constant load for baseline
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 200,
      maxVUs: 1000,
    },
    // 2. Peak load simulation: 10,000 concurrent users / 5,000 req/s
    peak_load: {
      executor: 'constant-arrival-rate',
      rate: 5000,
      timeUnit: '1s',
      duration: '5m',
      startTime: '2m',
      preAllocatedVUs: 1000,
      maxVUs: 10000,
    },
    // 3. Stress test: ramping up to push limits
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5000 },
        { duration: '5m', target: 10000 },
        { duration: '2m', target: 0 },
      ],
      startTime: '7m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95th percentile response time < 200ms
    http_req_failed: ['rate<0.001'],  // error rate < 0.1%
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'dummy-token'}`,
    },
  };
  
  let res = http.get('http://localhost:3000/health', params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(0.1); 
}
