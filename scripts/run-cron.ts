// scripts/run-cron.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.modelence.env' });

import { startApp } from 'modelence/server';
import paperModule from '../src/server/paper/index.js';
import { fetchAndInsertPapers } from '../src/server/paper/actions/fetch.js';
import { embedAllPapers } from '../src/server/paper/actions/embed.js';

async function main() {
  console.log('Initializing Modelence application...');
  // We start the app without a server to just initialize the backend
  await startApp({
    modules: [paperModule]
  });
  console.log('Modelence initialized.');

  console.log('Starting scheduled job: fetch and embed papers...');
  try {
    await fetchAndInsertPapers();
    await embedAllPapers();
    console.log('Successfully finished scheduled job.');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during the scheduled job:', error);
    process.exit(1);
  }
}

main();
