import express, { Application } from 'express';
import * as setup from './startup';
import { unhandledExceptionAndRejectionHandler } from './shared';

const app: Application = express();

unhandledExceptionAndRejectionHandler();
setup.setupServer(app);
setup.startServer(app);
