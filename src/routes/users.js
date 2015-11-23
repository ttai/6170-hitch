var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

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
router.get('/:user', function(req, res) {
  User.find({ '_id' : req.body.userID }, function(err, user) {
    res.render('user', { 'currentUser' : req.session.currentUser,
                         'user' : user });
  });
});

/*
  Determine whether there is a current user logged in

  GET /users/current
  No request parameters
  Response:
    - success.loggedIn: true if there is a user logged in; false otherwise
    - success.user: if success.loggedIn, the currently logged in user
*/
// router.get('/current', function(req, res) {
//   if (req.currentUser) {
//     utils.sendSuccessResponse(res, { loggedIn : true, user : req.currentUser.username });
//   } else {
//     utils.sendSuccessResponse(res, { loggedIn : false });
//   }
// });

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

/*
  Registers a new user based on kerberos and password.
*/

router.post('/', function(req, res) {
  if (isLoggedInOrInvalidBody(req, res)) {
    return;
  }
  var kerberos = req.body.kerberos;
  var password = req.body.password;

  User.createUser(kerberos, password, 
    function(err,user) {

      if (err) {
        if (err.taken) {
          res.render('register', {'e' : "Kerberos already exists"});
        } else {
          res.send("error");
        }
      } else {
        req.session.currentUser = user;
        res.redirect('/users');
      }
  });
});

// Sign in page
router.get('/signin', function(req, res) {
  if (req.session.currentUser) {
    res.redirect('/');
  } else {
    res.render('signin');
  }
});

// Allows a user to sign in
router.post('/signin', function(req, res) {
  var password = req.body.password;
  var userID = req.body.userID;
  users.verifyPassword(userID, password, function(err, user) {
    if (user) {
      req.session.currentUser = user;
      res.redirect('/users')
    } else {
      res.render('signin', {'e':"Incorrect Kerberos or Password"});
    }
  })
});

// Logs a user out
router.get('/logout', function(req, res) {
  req.session.currentUser = undefined;
  res.redirect('/');
});


  


module.exports = router;
