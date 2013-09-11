/**
  * RedFinch
  *
  * @author Joshua Beckman <@jbckmn> || <jsh@bckmn.com>
  * @license The MIT license. 2013
  *
  */
if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Reviews'
  });
}
var express = require('express')
    , load = require('express-load')
    , mongoose = require('mongoose')
    , passport = require('passport')
    , flash = require('connect-flash')
    , LocalStrategy = require('passport-local').Strategy
    , http = require('http')
    , path = require('path')
    , io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// For Heroku sockets to work
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// Define what/which mongo to yell at
var mongoUri = process.env.MONGOLAB_URI
                || process.env.MONGOHQ_URL
                || 'mongodb://localhost/reviews';

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.set('port', process.env.PORT || 5000);
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(flash());
    app.use(express.cookieParser('your secret here'));
    app.use(express.cookieSession({ secret: 'marybeth and the fox fighting bant', cookie: { maxAge: 1000*60*60 } })); // CHANGE THIS SECRET!
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});
app.configure('development', function(){
    app.use(express.errorHandler({ showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});

var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect(mongoUri);
server.listen(app.get('port'));

// Let's see what's going on
console.log("Express server listening on port %d in %s mode, connected to %s", app.get('port'), app.settings.env, mongoUri);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash('error', 'Please sign in.')
  res.redirect('/sign-in')
}
function ensureApiAuth(req, res, next) {
  Account.findOne({key:req.params.key}).lean().exec(function(error,authAccount){
    if (authAccount) { return next(); }
    res.redirect('/sign-in')
  })
}

require('./routes/frontEnd')(app, ensureAuthenticated, io);
require('./routes/api')(app, io, ensureApiAuth);

app.configure('development', function(){
  var repl = require('repl').start('> ');
  repl.context.Account = Account;
  repl.context.Subject = require('./models/subject');
  repl.context.Plan = require('./models/plan');
  repl.context.Review = require('./models/review');
  repl.context.io = io;
})