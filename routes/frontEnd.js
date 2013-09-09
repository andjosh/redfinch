
/*
 * Front End routes
 */

module.exports = function (app, ensureAuthenticated) {
  app.get('/', function(req, res) {
    res.render('index', { title: 'Reviews', user: req.user, message: req.flash('info'), error: req.flash('error') });
  });
}