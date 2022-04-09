exports.getPageNotFound = (req, res, _next) => {
  res.status(404).render('page-not-found', { 
    pageTitle: 'Page Not Found', 
    path: '/page-not-found',
    isAuthenticated: req.session.isLoggedIn
   });
};

exports.getInternalServerError = (req, res, _next) => {
  res.status(500).render('internal-server-error', { 
    pageTitle: 'Error!', 
    path: '/internal-server-error',
    isAuthenticated: req.session.isLoggedIn
   });
};