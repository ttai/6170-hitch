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


describe('Review', function() {
  var user1;
  var user2;
  var user3;
  var the_ride;
  var the_review;

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
                  Review.addReview(ride._id, user1._id, user3._id, 5, 'nice',
                                   function(err) {
                    reviewModel.findOne({'comment': 'nice'}, function(err, review) {
                      the_review = review;
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#reviewOwnership', function() {
    it('should return true', function(done) {
      Review.reviewOwnership(user1._id, the_review._id, function(err, owner) {
        assert.equal(owner, true);
        done();
      });
    });
    it('should return false', function(done) {
      Review.reviewOwnership(user2._id, the_review._id, function(err, owner) {
        assert.equal(owner, false);
        Review.reviewOwnership(user3._id, the_review._id, function(err, owner) {
          assert.equal(owner, false);
          done();
        });
      });
    });
  });
});
