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
    error400 = {"error":{"code":400,"message":"RedFeather doesn't understand what you mean."}},
    updated204 = {"success":{"code":204,"message":"Successfully updated."}};

module.exports = function (app, io, ensureApiAuth) {

  app.get('/dummy/subject', function(req, res) {
    var Chance = require('chance');
    var chance = new Chance();
    Account.findOne().lean().exec(function(err,account){
      var newSubject = new Subject();
      newSubject.accountId = account._id;
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
    })
  });
  app.get('/dummy/review', function(req, res) {
    var Chance = require('chance');
    var chance = new Chance();
    Account.findOne().lean().exec(function(err,account){
      Subject.findOne().lean().exec(function(err, subject){
        var newReview = new Review();
        newReview.subjectId = subject._id;
        newReview.reviewerId = account._id;
        newReview.content = chance.paragraph();
        newReview.title = chance.string();
        newReview.rating = chance.floating({min: 0, max: 10});
        newReview.save(function(err,resultReview){
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(resultReview));
          res.end();
        })
      })
    })
  });
  app.get('/api/subjects/:id', function(req, res) {
    Subject.findOne({_id:req.params.id}, '-__v -password').lean().exec(function(err, subject){
      if (!subject){
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(error404));
        res.end();
      }
      else {
        Review.find({subjectId:subject._id}, '-__v -subjectId').lean().exec(function(er, reviews){
          res.writeHead(200, { 'Content-Type': 'application/json' });
          var response = {'subject':subject, 'reviews':reviews};
          res.write(JSON.stringify(response));
          res.end();
        })
      }
    })
  });
  app.put('/api/subjects/:id', ensureApiAuth, function(req, res) {

  });
  app.get('/api/subjects/?search=:stringSearch', ensureApiAuth, function(req, res) {

  });
  app.post('/api/subjects/:id/reviews', ensureApiAuth, function(req, res) {
    Subject.findOne({_id:req.params.id}, '-__v -password').lean().exec(function(err, subject){
      var newReview = new Review();
      newReview.subjectId = subject._id;
      newReview.reviewerId = req.body.accountId;
      newReview.content = req.body.reviewContent;
      newReview.title = req.body.reviewTitle;
      newReview.rating = req.body.reviewRating;
      newReview.link = req.body.reviewLink;
      newReview.dateOfService = req.body.reviewDate;
      newReview.save(function(err,resultReview){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(resultReview));
        res.end();
      });
    });
  });
  app.get('/api/reviews/:id', ensureApiAuth, function(req, res) {

  });
  app.put('/api/reviews/:id', ensureApiAuth, function(req, res) {
    var conditions = { utilityRating: req.body.utilityRating, content: req.body.reviewContent, title: req.body.reviewTitle };
    Review.update({ _id: req.params.id}, conditions, function upDated(err) {
      if(err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(error400));
        res.end();
        throw err;
      }
      res.writeHead(204, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(updated204));
      res.end();
    });
  });
  app.post('/api/accounts', ensureApiAuth, function(req, res) {

  });
  app.get('/api/accounts/:id', ensureApiAuth, function(req, res) {

  });
}
