var express = require('express');
var router = express.Router();

var Ride = require('../models/Ride');

var moment = require('moment');
moment().format();

var GoogleMapsAPI = require('googlemaps');
var config = require('../googleConfig');
var gmAPI = new GoogleMapsAPI(config);

/*
  Require authentication on ALL access to /rides/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.session.currentUser) {
    res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
  } else {
    next();
  }
};

/*
  Require participation whenever accessing a particular ride
  This means that the client accessing the resource must be logged in
  as the user that originally created the ride. Clients who are not owners 
  of this particular resource will receive a 404.

  Why 404? We don't want to distinguish between rides that don't exist at all
  and rides that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information.
*/
var requireParticipation = function(req, res, next) {
	Ride.inRide(req.session.currentUser._id, req.params.ride, function (err, result) {
		if (err || result < 0) {
      res.redirect('/');
		} else {
			next();
		}
	});
};

/*
  Go to new ride page
*/
router.get('/new_ride', function(req, res) {
  if (req.session.currentUser) {
    res.render('new_ride', {user: req.session.currentUser});
  } else {
    res.redirect('/');
  }
});

// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.get('/:ride', requireParticipation);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must be a participant in that ride
  3. Requests are well-formed
*/
/*
  GET /rides
  No request parameters
  Response:
    - success: true if the server succeeded in getting the open rides
    - content: on success, an object with a single field 'rides', which contains a list of all open rides
    - err: on failure, an error message
*/
router.get('/', function(req, res) {
  Ride.getAllRides(function(err, rides) {
    if (err) {
      res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
    } else {
      res.render('rides', { 'user': req.session.currentUser, rides: rides });
    }
  });
});

/*
  GET /rides/:ride
  Request parameters:
    - ride: the unique ID of the ride within the logged in user's ride collection
  Response:
    - success: true if the server succeeded in getting the user's rides
    - content: on success, the ride object with ID equal to the ride referenced in the URL
    - err: on failure, an error message
*/
router.get('/:ride', function(req, res) {
  Ride.getRide(req.params.ride, function (err, ride) {
    if (err) {
        res.render('error', { 'message': 'Resource not found.',
                              'error.status': 404 });
    } else {
      Ride.getRiders(req.params.ride, function (err, riders) {
        if (err) {
          res.redirect('/');
        } else {
          var params = {
            origin: ride.origin,
            destination: ride.destination
          };
          gmAPI.directions(params, function(err, result) {
            if (result) {
              var start_loc = result.routes[0].legs[0].start_location;
              var end_loc = result.routes[0].legs[0].end_location;
              var duration = result.routes[0].legs[0].duration.text;
              var distance = result.routes[0].legs[0].distance.text;
              res.render('ride', { 'user': req.session.currentUser,
                                   'ride': ride,
                                   'riders': riders,
                                   'map': true,
                                   'distance': distance,
                                   'duration': duration,
                                   'coordA': start_loc,
                                   'coordB': end_loc });
            } else {
              res.render('ride', { 'user': req.session.currentUser,
                                   'ride': ride,
                                   'riders': riders,
                                   'map': false,
                                   'distance': '',
                                   'duration': '',
                                   'coordA': { lat: 42, lng: -71 },
                                   'coordB': { lat: 42, lng: -71 } });

            }
          });
        }
      });
    }
  });
});

/*
  Create a new ride in the system, and adds current user to the ride.

  POST /users
  Request body:
    - origin
    - destination
    - departure_time
    - total_capacity
    - transport
  Response:
    - success: true if user creation succeeded; false otherwise
    - err: on error, an error message
*/
router.post('/', function(req, res) {
  var time = req.body.date.concat(" ".concat(req.body.time))
  var departure_time = moment(time)
  Ride.addRide(req.session.currentUser._id, req.body.origin, req.body.destination,
               departure_time.toDate(), req.body.capacity, req.body.transport,
               function(err, result) {
   if (err) {
     res.render('error', {'message': 'Must be logged in to use this feature.',
                          'error.status': 500});
   } else {
     res.redirect('/');
   }
  });
});

router.post('/remove', function(req, res){
  var rideId = req.body.ride_id;
  var userId = req.body.user_id;
  Ride.getRide(rideId, function(err, ride) {
    if ((err || !ride) || (String(ride.creator) !== String(req.session.currentUser._id))) {
      res.render('error', {'message': 'Resource not found.', 'error.status': 404});
    } else {
      Ride.removeRider(rideId, userId, function(err, result) {
        if (err) {
          console.log(err);
          res.render('error',{'message': 'Resource not found.', 'error.status': 404});
        } else {
          res.redirect('/rides/' + rideId);
        }
      })
    }
  })
});

router.post('/participate', function(req, res) {
  var rideId = req.body.ride_id;
  Ride.inRide(req.session.currentUser._id, rideId, function (err, result) {
    if (err) {
      res.render('error', {'message': 'Resource not found.', 'error.status': 404});
    } else if (result < 0) {
      Ride.addRider(rideId, req.session.currentUser._id, function(err, result) {
        if (err) {
          res.render('error', {'message': 'Resource not found.', 'error.status': 404});
        } else {
          res.redirect('/rides/' + rideId);
        }
      });
    } else {
      Ride.removeRider(rideId, req.session.currentUser._id, function(err, result) {
        if (err) {
          res.render('error', {'message': 'Resource not found.', 'error.status': 404});
        } else {
          res.redirect(req.get('referer'));
        }
      });
    }
  });
});

module.exports = router;
