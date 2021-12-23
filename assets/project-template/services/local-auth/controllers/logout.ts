import { Middleware } from 'works';

export const logoutMiddleware: Middleware[] = [
  function logoutMiddleWare(req, res) {
    req.logout();
    res.redirect(`/login?message=${encodeURIComponent('You have successfully logged out')}`);
  }
]
