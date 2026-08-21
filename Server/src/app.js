import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import logger from './utils/logger.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import notFoundHandler from './middlewares/notFound.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security ───────────────────────────────────────────────────────────────
// Helmet sets various HTTP headers for security (XSS, clickjacking, sniffing, etc.)
app.set('trust proxy', 1);
app.use(helmet());

// MongoDB query injection protection
app.use(mongoSanitize());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ─── Parsing ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// ─── Compression ────────────────────────────────────────────────────────────
app.use(compression());

// ─── Logging ────────────────────────────────────────────────────────────────
// HTTP request logging via Morgan → Winston
if (config.app.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: logger.stream,
      skip: (req) => req.url === '/health',
    })
  );
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────
app.use(`/api/${config.app.apiVersion}`, apiLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: config.app.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── Swagger Documentation ──────────────────────────────────────────────────
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ParaSiteMedia — API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  })
);

// Serve raw JSON spec at /api-docs.json
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── API Routes ─────────────────────────────────────────────────────────────
import routes from './routes/index.js';
app.use(`/api/${config.app.apiVersion}`, routes);

// ─── Error Handling ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
