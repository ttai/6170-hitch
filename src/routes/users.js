var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Ride = require('../models/Ride');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

/*
  For both login and create user, we want to send an error code if the user
  is logged in, or if the client did not provide a username and password
  This function returns true if an error code was sent; the caller should return
  immediately in this case.
*/

var isLoggedInOrInvalidBody = function(req, res) {
  if (req.currentUser) {
    res.render('error', { 'message' : 'There is already a user logged in.',
                          'error.status' : 403 });
    return true;
  } else if (!(req.body.username && req.body.password)) {
    res.render('error', { 'message' : 'Username or password not provided.',
                          'error.status' : 400 });
    return true;
  }
  return false;
};

/*
  View the reviews of a particular user.
*/
router.get('/user/:user', function(req, res) {
  User.getUser(req.body.userID, function(err, user) {
    if (err) {
      res.render('error', { 'message' : 'Resource not found.', 'error.status': 404});
    } else{
    res.render('user', { 'currentUser' : req.session.currentUser,
                         'user' : user });
    }
  });
});

/*
  Go to register page
*/

router.get('/register', function(req, res) {
  if (req.session.currentUser) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

// Gets list of all available rides after login
router.get('/', function(req, res, next) {
  var currentUser = req.session.currentUser;
  if (currentUser) {
    res.render('index', {"username": currentUser});
  } else {
    res.redirect('/');
  }
});

/*
  Registers a new user based on kerberos and password.
*/

router.post('/', function(req, res) {
  if (isLoggedInOrInvalidBody(req, res)) {
    return;
  }
  var username = req.body.username;
  var password = req.body.password;

  User.createUser(username, password, 
    function(err,user) {

      if (err) {
        if (err.taken) {
          res.render('register', {'e' : "Kerberos already exists"});
        } else {
          res.send("error");
        }
      } else {
        req.session.currentUser = user;
        res.redirect('/');
      }
  });
});

// Login page
router.get('/login', function(req, res) {
  if (req.session.currentUser) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

// Allows a user to sign in
router.post('/login', function(req, res) {
  var password = req.body.password;
  var username = req.body.username;
  User.verifyPassword(username, password, function(err, user) {
    if (user) {
      req.session.currentUser = user;
      res.redirect('/')
    } else {
      res.render('login', {'e':"Incorrect Kerberos or Password"});
    }
  })
});

// Logs a user out
router.get('/logout', function(req, res) {
  req.session.currentUser = undefined;
  res.redirect('/');
});

// Get the rides of the current logged in user
router.get('/my_rides', function(req, res) {
  Ride.find({ '_id' : req.session.currentUser.rides }, function(err, rides) {
    res.render('my_rides', { 'currentUser' : req.session.currentUser,
                             'rides' : rides });
  });
});

module.exports = router;
