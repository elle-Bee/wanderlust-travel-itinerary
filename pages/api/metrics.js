import { NextApiRequest, NextApiResponse } from 'next';
import client from 'prom-client';

const register = new client.Registry();

const requestCounter = new client.Counter({
  name: 'nextjs_app_request_count',
  help: 'Number of requests to the app',
  labelNames: ['method', 'status'],
});

register.registerMetric(requestCounter);

const requestDuration = new client.Histogram({
  name: 'nextjs_app_request_duration_seconds',
  help: 'Request duration in seconds',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

register.registerMetric(requestDuration);

const generateClickCounter = new Counter({
    name: 'generate_button_clicks_total',
    help: 'Total number of times the generate button was clicked.',
    labelNames: ['status'], // You can add additional labels, e.g. success/failure
  });

export default async function handler(req, res) {
  const end = requestDuration.startTimer();
  
  requestCounter.inc({ method: req.method, status: res.statusCode });

  if (req.method === 'POST') {
    // You can increment based on status or any other logic
    generateClickCounter.inc({ status: 'clicked' }, 1); // Increment the click count
  }

  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());

  end();
}
