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
      console.log('found account')
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
    var conditions = { 
      description: req.body.description, 
      name: req.body.name, 
      planId: req.body.planId,
      email: req.body.email,
      link: req.body.link,
      phone: req.body.phone,
      streetAddress: req.body.streetAddress,
      postalCode: req.body.postalCode,
      state: req.body.state,
      country: req.body.country,
      password: req.body.password,
      approvedHosts: req.body.approvedHosts,
      image: req.body.image,
      discoverable: req.body.discoverable
    };
    Subject.update({ _id: req.params.id}, conditions, function upDated(err) {
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
  app.get('/api/subjectSearch', ensureApiAuth, function(req, res) {
    // To do
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
        if(err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(error400));
          res.end();
          throw err;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(resultReview));
        res.end();
      });
    });
  });
  app.get('/api/reviews/:id', ensureApiAuth, function(req, res) {
    Review.findOne({_id:req.params.id}, '-__v').lean().exec(function(err, review){
      if (!review){
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(error404));
        res.end();
      }
      else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(review));
        res.end();
      }
    })
  });
  app.put('/api/reviews/:id', ensureApiAuth, function(req, res) {
    var conditions = { 
      utilityRating: req.body.utilityRating, 
      content: req.body.reviewContent, 
      title: req.body.reviewTitle 
    };
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
    if (req.body.password != req.body.password_conf) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(error400));
      res.end();
    }
    Account.register(new Account({ email : req.body.username, username: req.body.username.match(/^[^@]*/) }), req.body.password, function(err, account) {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(error400));
            res.end();
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
        // Then respond
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(account));
        res.end();
    });
  });
  app.get('/api/accounts/:id', ensureApiAuth, function(req, res) {
    Account.findOne({_id:req.params.id}, '-__v -fullAccess -admin -hash -salt -key -modified -email').lean().exec(function(err, account){
      if (!account){
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(error404));
        res.end();
      }
      else {
        Review.find({reviewerId:account._id}, '-__v -reviewerId').lean().exec(function(er, reviews){
          res.writeHead(200, { 'Content-Type': 'application/json' });
          var response = {'account':account, 'reviews':reviews};
          res.write(JSON.stringify(response));
          res.end();
        })
      }
    })
  });
}
