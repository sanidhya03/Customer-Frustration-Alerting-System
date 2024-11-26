/*
 * Copyright (c) 2024 DevRev Inc. All rights reserved.

 * Customer Frustration Alerting System: This system processes customer interaction events,
 * detects frustration patterns, and alerts the relevant teams for resolution/escalation.
 */

import bodyParser from 'body-parser';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { HTTPClient, HttpRequest } from './http_client';

dotenv.config();

const DEVREV_ACCESS_TOKEN = process.env.DEVREV_ACCESS_TOKEN;
if (!DEVREV_ACCESS_TOKEN) {
  throw new Error("DEVREV_ACCESS_TOKEN is not defined in the .env file.");
}

const app: Express = express();
app.use(bodyParser.json(), bodyParser.urlencoded({ cdextended: false }));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Customer Frustration Alerting System is running at http://localhost:${port}`);
});

/**
 * Endpoint to process frustration alerts.
 * Expected payload: { customerId, interactionDetails, frustrationLevel }
 */
app.post('/frustration-alert', async (req: Request, res: Response) => {
  const { customerId, interactionDetails, frustrationLevel } = req.body;

  if (!customerId || !interactionDetails || frustrationLevel === undefined) {
    return res.status(400).json({
      message: 'Invalid request format: customerId, interactionDetails, and frustrationLevel are required.',
    });
  }

  console.log('Received frustration alert:', { customerId, frustrationLevel });

  try {
    // Process frustration level
    const response = await handleFrustrationAlert(customerId, interactionDetails, frustrationLevel);

    res.status(200).json({
      message: 'Frustration alert processed successfully.',
      data: response,
    });
  } catch (error) {
    console.error('Error handling frustration alert:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Processes frustration alert and decides escalation/notification strategy.
 */
async function handleFrustrationAlert(customerId: string, interactionDetails: any, frustrationLevel: number) {
  // Determine severity based on frustrationLevel
  let severity: string;
  if (frustrationLevel >= 8) {
    severity = 'High';
  } else if (frustrationLevel >= 5) {
    severity = 'Medium';
  } else {
    severity = 'Low';
  }

  console.log(`Customer ${customerId} reported frustration level ${frustrationLevel} (Severity: ${severity})`);

  // Perform actions based on severity
  if (severity === 'High') {
    await escalateToSupportTeam(customerId, interactionDetails);
  } else if (severity === 'Medium') {
    await sendNotificationToManager(customerId, interactionDetails);
  }

  return { severity, action: severity === 'High' ? 'Escalation' : 'Notification' };
}

/**
 * Escalates a high-severity alert to the support team.
 */
async function escalateToSupportTeam(customerId: string, interactionDetails: any) {
  console.log('Escalating to support team:', { customerId, interactionDetails });

  const client = new HTTPClient({
    endpoint: 'https://example.endpoint.devrev.ai',
    token: DEVREV_ACCESS_TOKEN,
  });

  const request: HttpRequest = {
    path: '/support/escalate',
    body: { customerId, interactionDetails, urgency: 'High' },
  };

  try {
    const response = await client.post(request);
    console.log('Escalation successful:', response);
  } catch (error) {
    console.error('Error escalating to support team:', error);
    throw new Error('Failed to escalate alert to support team');
  }
}

/**
 * Sends a notification to the manager for medium-severity alerts.
 */
async function sendNotificationToManager(customerId: string, interactionDetails: any) {
  console.log('Sending notification to manager:', { customerId, interactionDetails });

  const client = new HTTPClient({
    endpoint: 'https://example.endpoint.devrev.ai',
    token: DEVREV_ACCESS_TOKEN,
  });

  const request: HttpRequest = {
    path: '/notifications/manager',
    body: { customerId, interactionDetails, severity: 'Medium' },
  };

  try {
    const response = await client.post(request);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification to manager:', error);
    throw new Error('Failed to send notification to manager');
  }
}

/**
 * Endpoint for health checks
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Customer Frustration Alerting System is healthy' });
});

