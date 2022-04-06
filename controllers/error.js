exports.getPageNotFound = (_req, res, _next) => {
  res.status(404).render('page-not-found', { 
    pageTitle: 'Page Not Found', 
    path: '/page-not-found',
   });
};

exports.getInternalServerError = (_req, res, _next) => {
  res.status(500).render('internal-server-error', { 
    pageTitle: 'Error!', 
    path: '/internal-server-error',
   });
};