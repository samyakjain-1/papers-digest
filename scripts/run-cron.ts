// scripts/run-cron.ts
import { fetchAndInsertPapers } from '../src/server/paper/actions/fetch';
import { embedAllPapers } from '../src/server/paper/actions/embed';

async function main() {
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
