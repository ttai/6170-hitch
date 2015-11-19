var express = require('express');
var router = express.Router();
var users = require('../models/user');

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
    utils.sendErrResponse(res, 403, 'There is already a user logged in.');
    return true;
  } else if (!(req.body.username && req.body.password)) {
    utils.sendErrResponse(res, 400, 'Username or password not provided.');
    return true;
  }
  return false;
};

/*
  Determine whether there is a current user logged in

  GET /users/current
  No request parameters
  Response:
    - success.loggedIn: true if there is a user logged in; false otherwise
    - success.user: if success.loggedIn, the currently logged in user
*/
router.get('/current', function(req, res) {
  if (req.currentUser) {
    utils.sendSuccessResponse(res, { loggedIn : true, user : req.currentUser.username });
  } else {
    utils.sendSuccessResponse(res, { loggedIn : false });
  }
});


module.exports = router;