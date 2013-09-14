
/*
 * Front End routes
 */
var passport = require('passport'),
    Account = require('../models/account')
    , Plan = require('../models/plan')
    , Review = require('../models/review')
    , Subject = require('../models/subject');

module.exports = function (app, ensureAuthenticated) {
  app.get('/', function(req, res) {
    res.render('index', { title: 'RedFeather', user: req.user, message: req.flash('message'), error: req.flash('error') });
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
        // mg.sendText('nest@RedFeather.io', [req.body.email],
        //   'Welcome to RedFeather!','Hi '+name+'! '+
        //   'Congratulations on joining RedFeather! '+
        //   'Thanks! '+
        //   '- Josh, RedFeather.io',
        //   'RedFeather.mailgun.org', {},
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
    Subject.find({accountId:req.user._id}, '-__v -password').lean().exec(function(err, subjects){
      Review.find({reviewerId:req.user._id}, '').lean().exec(function(err, reviews){
        res.render('account', { user: req.user, title : "Your Nest", subjects: subjects, reviews: reviews, message: req.flash('message'), error: req.flash('error') });
      });
    });
  });
  app.get('/subject/new', ensureAuthenticated, function(req, res){
    Plan.find().lean().exec(function(err,plans){
      var industries = Subject.industries;
      res.render('subjectNew', { user: req.user, title : "New Subject", plans: plans, industries: industries, message: req.flash('message'), error: req.flash('error') });
    });
  });
  app.get('/subject/:id/edit', ensureAuthenticated, function(req, res){
    Subject.findOne({_id:req.params.id}, '-__v -password').lean().exec(function(err, subject){
      Plan.find().lean().exec(function(err,plans){
        var industries = Subject.industries;
        res.render('subjectEdit', { user: req.user, title : "Edit "+subject.name, plans: plans, subject: subject, industries: industries, message: req.flash('message'), error: req.flash('error') });
      })
    });
  });
  app.get('/subject/:id', ensureAuthenticated, function(req, res){
    res.render('subject', { user: req.user, title : subject.name, subject: subject, message: req.flash('message'), error: req.flash('error') });
  });
}