import express from 'express';


export const addUsernameToQuery: express.RequestHandler = function addUsernameToQuery(req, _, next) {
  if (typeof req.query === 'object' && req.query !== null && 'username' in (req.user || {})) {
    req.query['username'] = (req.user as {username: string}).username;
  }
  next();
}