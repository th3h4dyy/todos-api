import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from '../shared';
import { Database } from '../shared/';
import { usersRelativeRoute, usersRouter } from '../controllers';

function setupDevelopment(app: Application): void {
  app.use(morgan('dev'));
}

function setupProduction(app: Application): void {
  app.use(helmet());
  app.use(compression());
}

function setRequestOptions(app: Application): void {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

function registerRoutes(app: Application): void {
  const baseRoute = '/api/';
  app.use(baseRoute + usersRelativeRoute, usersRouter);
}

export function setupServer(app: Application): void {
  if (process.env.NODE_ENV === 'production') {
    setupProduction(app);
  } else {
    setupDevelopment(app);
  }
  setRequestOptions(app);
  registerRoutes(app);
  app.use(errorHandler);
}

export function startServer(app: Application): void {
  const port = process.env.PORT || 3000;
  Database.syncDatabase(true).then(() => {
    app.listen(port, () => console.log(`Express server is running on port ${port}`));
  });
}
