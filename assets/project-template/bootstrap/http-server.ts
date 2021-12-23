import { Express } from 'express';
import { httpRouter } from '~/bootstrap/http-router';
import * as http from 'http';

export const httpServer = http.createServer(httpRouter as Express);
