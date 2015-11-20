var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User');
var Ride = require('../models/Ride');

/*
  Require authentication on ALL access to /rides/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }
};

/*
  Require ownership whenever accessing a particular ride
  This means that the client accessing the resource must be logged in
  as the user that originally created the ride. Clients who are not owners 
  of this particular resource will receive a 404.

  Why 404? We don't want to distinguish between rides that don't exist at all
  and rides that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information.
*/
var requireParticipation = function(req, res, next) {
  var ids = //do we have the ids of people in the ride?
  if (ids.indexOf(req.currentUser._id) < 0)) {	
    utils.sendErrResponse(res, 404, 'Resource not found.');
  } else {
    next();
  }
};

/*
  For create requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function(req, res, next) {
  if (!req.body.content) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

/*
  Grab a ride from the store whenever one is referenced with an ID in the
  request path (any routes defined with :ride as a paramter).
*/
router.param('ride', function(req, res, next, rideId) {
  User.getRide(req.currentUser._id, rideId, function(err, ride) {
    if (ride) {
      req.ride = ride;
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
});

// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.all('/:ride', requireOwnership);
router.post('/', requireContent);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that tweet
  3. Requests are well-formed
*/

/*
  GET /tweets
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's tweets
    - content: on success, an object with a single field 'tweets', which contains a list of all users' tweets
    - err: on failure, an error message
*/
router.get('/', function(req, res) {
  User.getAllTweets(function(err, tweets) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res, { tweets: tweets });
    }
  });
});