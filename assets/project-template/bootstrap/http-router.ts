import { readWorksConfigFile, getRootDir } from 'works';
import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';

import { passport } from '~/bootstrap/passport';
import { sessionParser } from '~/bootstrap/session-parser';
import { apiRouter } from '~/bootstrap/api-router';
import { csvRouter } from '~/bootstrap/csv-router';

// TODO: add csurf

export const httpRouter = express.Router();
const config = readWorksConfigFile();
const rootDir = getRootDir();
const relativeClientPath = config.spaClientPath
if (!relativeClientPath) throw Error('Non SPA infrastructures not yet supported');
const clientPath = path.join(rootDir, relativeClientPath);
// TODO: add differentation for dealing wih spaClientPath being empty

// httpRouter.disable('x-powered-by');
// TODO: check if you can disable x-powered-by
httpRouter.use(bodyParser.json({limit: '30mb'}));
httpRouter.use(sessionParser);
httpRouter.use(passport.initialize());
httpRouter.use(passport.session());
httpRouter.use(compression.default());
httpRouter.get('/', (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    return res.redirect('/login');
  }
});
httpRouter.use(express.static(clientPath));
httpRouter.use('/api', apiRouter);
httpRouter.use('/csv', csvRouter)
