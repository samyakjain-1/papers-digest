// scripts/run-cron.ts
console.log('Script starting...');
import dotenv from 'dotenv';
try {
  dotenv.config({ path: '.modelence.env' });
  console.log('Dotenv configured.');
} catch (e) {
  console.error('Error loading .env file:', e);
  process.exit(1);
}

import { startApp } from 'modelence/server';
import paperModule from '../src/server/paper/index.js';
import { fetchAndInsertPapers } from '../src/server/paper/actions/fetch.js';
import { embedAllPapers } from '../src/server/paper/actions/embed.js';

async function main() {
  try {
    console.log('Initializing Modelence application...');
    // We start the app without a server to just initialize the backend
    await startApp({
      modules: [paperModule]
    });
    console.log('Modelence initialized.');

    console.log('Starting scheduled job: fetch and embed papers...');
    console.log('Fetching and inserting papers...');
    await fetchAndInsertPapers();
    console.log('Finished fetching and inserting papers.');
    console.log('Embedding all papers...');
    await embedAllPapers();
    console.log('Finished embedding all papers.');
    console.log('Successfully finished scheduled job.');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during the scheduled job:', error);
    process.exit(1);
  }
}

main();
