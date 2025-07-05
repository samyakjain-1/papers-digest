import dotenv from 'dotenv';
dotenv.config({ path: '.modelence.env' });

import { startApp } from 'modelence/server';
import paperModule from './paper';

startApp({
  modules: [paperModule]
});
