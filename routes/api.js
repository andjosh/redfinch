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
var error404 = {"error":{"code":404,"message":"Nothing found by that identifier."}},
    error400 = {"error":{"code":400,"message":"RedFinch doesn't understand what you mean."}};

module.exports = function (app, io, ensureApiAuth) {

  app.get('/dummy/subject', function(req, res) {
    var Chance = require('chance');
    var chance = new Chance();
    var newSubject = new Subject();
    newSubject.name = chance.name();
    newSubject.description = chance.paragraph();
    newSubject.email = chance.email();
    newSubject.link = chance.domain();
    newSubject.password = chance.word();
    newSubject.save(function(err,resultSubject){
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(resultSubject));
      res.end();
    })
  });
  app.get('/dummy/review', function(req, res) {
    var Chance = require('chance');
    var chance = new Chance();
    Subject.findOne().lean().exec(function(err, subject){
      var newReview = new Review();
      newReview.subjectId = subject._id;
      newReview.content = chance.paragraph();
      newReview.title = chance.string();
      newReview.rating = chance.floating({min: 0, max: 10});
      newReview.save(function(err,resultReview){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(resultReview));
        res.end();
      })
    })
  });
  app.get('/api/:key/subjects/:id', ensureApiAuth, function(req, res) {
    Subject.findOne({_id:req.params.id}).lean().exec(function(err, subject){
      if (!subject){
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(error404));
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
