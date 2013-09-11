
/*
 * Front End routes
 */
var passport = require('passport'),
    Account = require('../models/account');

module.exports = function (app, ensureAuthenticated) {
  app.get('/', function(req, res) {
    res.render('index', { title: 'RedFinch', user: req.user, message: req.flash('message'), error: req.flash('error') });
  });
  app.get('/register', function(req, res) {
    res.render('register', { title: 'Register', user: req.user, message: req.flash('message'), error: req.flash('error') });
  });
  app.post('/register', function(req, res) {
    if (req.body.password != req.body.password_conf) {
      req.flash('error', 'Password and password confirmation must match.')
      res.redirect('/register');
    }
    Account.register(new Account({ email : req.body.username, username: req.body.username.match(/^[^@]*/) }), req.body.password, function(err, account) {
        if (err) {
            req.flash('error', 'That email is already in use.')
            return res.redirect('/register');
        }
        var name = req.body.username.match(/^[^@]*/)
        // Welcome email
        // mg.sendText('nest@redfinch.io', [req.body.email],
        //   'Welcome to RedFinch!','Hi '+name+'! '+
        //   'Congratulations on joining RedFinch! '+
        //   'Thanks! '+
        //   '- Josh, redfinch.io',
        //   'redfinch.mailgun.org', {},
        //   function(err) {
        //     if (err) console.log('Oh noes: ' + err);
        //     else     console.log('Successful welcome email');
        // });
        // Then redirect
        passport.authenticate('local')(req, res, function () {
          req.flash('message', 'Great, '+name+'! Welcome to your nest.')
          res.redirect('/account');
        })
    });
  });
  app.get('/sign-in', function(req, res) {
    res.render('signin', { title: 'Sign In', user: req.user, message: req.flash('message'), error: req.flash('error') });
  });

  app.post('/sign-in', passport.authenticate('local', { failureRedirect: '/sign-in', failureFlash: 'Invalid email or password.' }), function(req, res) {
    res.redirect('/account');
  });

  app.get('/sign-out', function(req, res) {
    req.logout();
    req.flash('message', 'You have been signed out.')
    res.redirect('/');
  });

  app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user, title : "Your Nest", message: req.flash('message'), error: req.flash('error') });
  });
}