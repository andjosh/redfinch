
/*
 * Front End routes
 */

module.exports = function (app, ensureAuthenticated) {
  app.get('/', function(req, res) {
    res.render('index', { title: 'Red Finch', user: req.user, message: req.flash('info'), error: req.flash('error') });
  });
  app.get('/register', function(req, res) {
    res.render('register', { title: 'Register for Red Finch', user: req.user, message: req.flash('info'), error: req.flash('error') });
  });
}