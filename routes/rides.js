var express = require('express');
var router = express.Router();

var Ride = require('../models/Ride');

var moment = require('moment');
moment().format();

var GoogleMapsAPI = require('googlemaps');
var config = require('../googleConfig');
var gmAPI = new GoogleMapsAPI(config);
var validator = require('validator');

/*
  Require authentication on ALL access to /rides/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.session.currentUser) {
    res.render('error', {'message': 'Must be logged in to use this feature.', 'status': 500});
  } else {
    next();
  }
};

/*
  Go to new ride page
*/
router.get('/new_ride', function(req, res) {
  if (req.session.currentUser) {
    res.render('new_ride', {'csrf': req.csrfToken(), 'user': req.session.currentUser});
  } else {
    res.redirect('/');
  }
});

// Register the middleware handlers above.
router.all('*', requireAuthentication);

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
      res.render('error', {'message': 'An unknown error occurred.', 'status': 500});
    } else {
      res.render('rides', { 'csrf': req.csrfToken(), 'user': req.session.currentUser, rides: rides });
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
                              'status': 404 });
    } else {
      Ride.getRiders(req.params.ride, function (err, riders) {
        if (err) {
          res.redirect('/');
        } else {
          if (ride.origin_coord && ride.dest_coord) {
            var start_loc = { lat: ride.origin_coord[1], lng: ride.origin_coord[0] };
            var end_loc = { lat: ride.dest_coord[1], lng: ride.dest_coord[0] };
            var currentTime = new Date();
            res.render('ride', { 'csrf': req.csrfToken(),
                                 'user': req.session.currentUser,
                                 'ride': ride,
                                 'riders': riders,
                                 'map': true,
                                 'distance': ride.distance,
                                 'duration': ride.duration,
                                 'coordA': start_loc,
                                 'coordB': end_loc,
                                 'currentTime': currentTime });
          } else {
            res.render('ride', { 'csrf': req.csrfToken(),
                                 'user': req.session.currentUser,
                                 'ride': ride,
                                 'riders': riders,
                                 'map': false,
                                 'distance': '',
                                 'duration': '',
                                 'coordA': { lat: 42.359155, lng: -71.0930576 },
                                 'coordB': { lat: 42, lng: -71 },
                                 'currentTime': currentTime });
          }
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
  var time = req.body.date.concat(" ".concat(req.body.time));
  var departure_time = moment(time);
  var now = new Date();
  if (!req.body.origin || !req.body.destination || !departure_time || departure_time < now || !req.body.capacity || req.body.capacity < 1 || req.body.capacity >6 || !req.body.transport){
    res.render('error', {'message': 'Invalid inputs.',
                         'status': 500});
  } else {
    var params = {
      origin: validator.escape(validator.toString(req.body.origin)),
      destination: validator.escape(validator.toString(req.body.destination))
    };
    gmAPI.directions(params, function(err, result) {
      if (result) {
        var start_loc = result.routes[0].legs[0].start_location;
        var end_loc = result.routes[0].legs[0].end_location;
        var duration = result.routes[0].legs[0].duration.text;
        var distance = result.routes[0].legs[0].distance.text;

        Ride.addRide(req.session.currentUser._id, validator.escape(validator.toString(req.body.origin)), validator.escape(validator.toString(req.body.destination)),
                     validator.toDate(departure_time.toDate()), [start_loc.lng, start_loc.lat], [end_loc.lng, end_loc.lat], distance, duration,
                     validator.toInt(req.body.capacity), validator.escape(validator.toString(req.body.transport)),
                     function(err, ride) {
                       if (err) {
                         res.render('error', {'message': 'An unknown error occurred.',
                                              'status': 500});
                       } else {
                         res.redirect('/rides/' + ride._id);
                       }
        });
      } else {
        Ride.addRide(req.session.currentUser._id, validator.escape(validator.toString(req.body.origin)), validator.escape(validator.toString(req.body.destination)),
                     validator.toDate(departure_time.toDate()), undefined, undefined, undefined, undefined,
                     validator.toInt(req.body.capacity), validator.escape(validator.toString(req.body.transport)),
                     function(err, ride) {
         if (err) {
           res.render('error', {'message': 'An unknown error occurred.',
                                'status': 500});
         } else {
           res.redirect('/rides/' + ride._id);
         }
        });
      }
    });
  }
});


router.post('/remove', function(req, res){
  var rideId = req.body.ride_id;
  var userId = req.body.user_id;
  Ride.getRide(rideId, function(err, ride) {
    if ((err || !ride) || (String(ride.creator) !== String(req.session.currentUser._id))) {
      res.render('error', {'message': 'Resource not found.', 'status': 404});
    } else {
      Ride.removeRider(rideId, userId, function(err, result) {
        if (err) {
          res.render('error',{'message': 'Resource not found.', 'status': 404});
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
      res.render('error', {'message': 'Resource not found.', 'status': 404});
    } else if (result < 0) {
      Ride.addRider(rideId, req.session.currentUser._id, function(err, result) {
        if (err) {
          res.render('error', {'message': 'Resource not found.', 'status': 404});
        } else {
          res.redirect('/rides/' + rideId);
        }
      });
    } else {
      Ride.removeRider(rideId, req.session.currentUser._id, function(err, result) {
        if (err) {
          res.render('error', {'message': 'Resource not found.', 'status': 404});
        } else {
          res.redirect('/');
        }
      });
    }
  });
});

// go to the search page
router.get('/search', function(req,res) {
  if (req.session.currentUser) {
    res.render('search', {'csrf': req.csrfToken(), 'user': req.session.currentUser});
  } else {
    res.redirect('/');
  }
});

//search for a ride by origin location, destination location, and optionally date
router.post('/search', function(req, res) {
  var origin = validator.escape(validator.toString(req.body.origin));
  var destination = validator.escape(validator.toString(req.body.destination));
  var date = validator.toDate(req.body.date);
  if (!origin || !destination ){
    res.render('error', {'message': 'Invalid inputs.',
                         'status': 500});
  } else {
    var params = {
      origin: origin,
      destination: destination
    };
    gmAPI.directions(params, function(err, result) {
      if (result) {
        var start_loc = result.routes[0].legs[0].start_location;
        var end_loc = result.routes[0].legs[0].end_location;
        var duration = result.routes[0].legs[0].duration.text;
        var distance = result.routes[0].legs[0].distance.text;

        Ride.findRidesbyLocation(start_loc.lng, start_loc.lat, function(err, rides) {
                    if (err) {
                       res.render('error', {'message': 'An unknown error occurred.',
                                            'status': 500});
                    } else {
                      if (date) {
                        var end = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                        rides.filter(function(ride) {
                          return ride.departure_time >= date && ride.departure_time < end;
                        });
                    }
                      res.render('index', { 'csrf': req.csrfToken(),
                        'user' : currentUser,
                        'rides' : rides,
                        'loggedIn' : logged_in });
                    }
        });
      } else {        
        res.render('search', {'e': 'Invalid inputs.', 'user': req.session.currentUser, 'csrf': req.csrfToken() });
      }
    });
  }
});

module.exports = router;
