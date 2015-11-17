var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = Schema({
  kerberos: String,
  reviews: [{ type: ObjectId, ref: 'reviewSchema' }],
  rides: [{ type: ObjectId, ref: 'rideSchema' }]
});

var rideSchema = Schema({
  origin: String,
  destination: String,
  departure_time: Date, 
  capacity: Number,
  creator: { type: ObjectId, ref: 'userSchema' },
  riders: [{ type: ObjectId, ref: 'userSchema' }],
  transport: String,
  passphrase: String
});

var reviewSchema = Schema({
  ride: { type: ObjectId, ref: 'rideSchema' },
  reviewer: { type: ObjectId, ref: 'userSchema' },
  reviewee: { type: ObjectId, ref: 'userSchema' },
  rating: Number,
  comment: String
});

exports.userSchema = userSchema;
exports.rideSchema = rideSchema;
exports.reviewSchema = reviewSchema;
