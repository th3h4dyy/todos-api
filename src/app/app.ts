import express, { Application } from 'express';
import dotenv from 'dotenv';
import * as setup from './startup';
import { unhandledExceptionAndRejectionHandler } from './shared';

dotenv.config();
const app: Application = express();

unhandledExceptionAndRejectionHandler();
setup.setupServer(app);
setup.startServer(app);
