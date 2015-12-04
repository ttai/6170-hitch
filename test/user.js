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


describe('User', function() {
  var user1;
  var user2;
  var user3;

  beforeEach(function(done) {
    userModel.remove({}, function() {
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
            done();
          });
        });
      });
    });
  });

  describe('#getUser', function() {
    it('should return user', function(done) {
      User.getUser(user1._id, function(err, ruser1) {
        User.getUser(user2._id, function(err, ruser2) {
          User.getUser(user3._id, function(err, ruser3) {
            assert.equal(user1.kerberos, ruser1.kerberos);
            assert.equal(user2.kerberos, ruser2.kerberos);
            assert.equal(user3.kerberos, ruser3.kerberos);
            done();
          });
        });
      });
    });
  });

  describe('#getKerberos', function() {
    it('should return kerberos', function(done) {
      User.getKerberos(user1._id, function(err, kerb1) {
        User.getKerberos(user2._id, function(err, kerb2) {
          User.getKerberos(user3._id, function(err, kerb3) {
            assert.equal(user1.kerberos, kerb1);
            assert.equal(user2.kerberos, kerb2);
            assert.equal(user3.kerberos, kerb3);
            done();
          });
        });
      });
    });
  });

  describe('createUser', function() {
    it('should store user in db', function(done) {
      userModel.find({ '_id': user1._id }, function(err, users) {
        assert.equal(users.length, 1);
        assert.equal(users[0].kerberos, user1.kerberos);
        done();
      });
    });
  });
});
