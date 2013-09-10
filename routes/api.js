
/*
 * API Routes

 get subject
  reviews
put subject
destroy subject (?)
post subjects
get subjects
  (near)
  (like)
post reviews
get review
put review
post users
get user

res.writeHead(200, { 'Content-Type': 'application/json' });
res.write();
res.end();
 */
var Account = require('../models/account')
    , Plan = require('../models/plan')
    , Review = require('../models/review')
    , Subject = require('../models/subject');

module.exports = function (app, io, ensureApiAuth) {
  app.get('/register', function(req, res) {
    res.render('register', { title: 'Register', user: req.user, message: req.flash('info'), error: req.flash('error') });
  });
  app.get('/api/:key/finches/:id', ensureApiAuth, function(req, res) {
    Subject.findOne({_id:req.params.id}).lean().exec(function(err, subject){
      if (!subject){
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write('{"error":{"type":404, "message":"No finches found by that identifier."}}');
        res.end();
      }
      else {
        Review.find({subjectId:subject._id}).lean().exec(function(er, reviews){
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(subject);
          res.write(reviews);
          res.end();
        })
      }
    })
  });
}