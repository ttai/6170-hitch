var assert = require('assert');
var http = require('http');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:/test');

var schemas = require('../models/schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;

var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');


describe('Ride', function() {
  var user1;
  var user2;
  var user3;
  var the_ride;

  beforeEach(function(done) {
    userModel.remove({}, function() {
      rideModel.remove({}, function() {
        reviewModel.remove({}, function() {
          userModel.create({
            kerberos: 'user1@mit.edu',
            password: 'password1',
            rating: 5,
            reviews: [],
            rides: []
          }, function(err, returned_user1) {
            userModel.create({
              kerberos: 'user2@mit.edu',
              password: 'password2',
              rating: 5,
              reviews: [],
              rides: []
            }, function(err, returned_user2) {
              userModel.create({
                kerberos: 'user3@mit.edu',
                password: 'password3',
                rating: 5,
                reviews: [],
                rides: []
              }, function(err, returned_user3) {
                user1 = returned_user1;
                user2 = returned_user2;
                user3 = returned_user3;
                Ride.addRide(user1._id, 'orig', 'dest', Date.now(), 4, 'Uber',
                             function(err, ride) {
                  the_ride = ride;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#getAllRides', function() {
    it('should return all the rides', function(done) {
      Ride.getAllRides(function(err, rides) {
        assert.equal(rides.length, 1);
        assert.deepEqual(rides[0]._id, the_ride._id);
        done();
      });
    });
  });
});
