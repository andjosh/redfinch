
/*
 * API Routes
 */

module.exports = function (app) {
  app.get('/register', function(req, res) {
    res.render('register', { title: 'Register', user: req.user, message: req.flash('info'), error: req.flash('error') });
  });
}