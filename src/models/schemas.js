var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = Schema({
  kerberos: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  rating: Number,
  reviews: [{ type: ObjectId, ref: 'reviewSchema' }],
  rides: [{ type: ObjectId, ref: 'rideSchema' }]
});

var rideSchema = Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departure_time: { type: Date, required: true },
  total_capacity: { type: Number, required: true },
  remaining_capacity: { type: Number, required: true },
  riders: [{ type: ObjectId, ref: 'userSchema' }],
  transport: String,
  passphrase: String
});

var reviewSchema = Schema({
  ride: { type: ObjectId, ref: 'rideSchema', required: true },
  reviewer: { type: ObjectId, ref: 'userSchema', required: true },
  reviewee: { type: ObjectId, ref: 'userSchema', required: true },
  rating: { type: Number, required: true },
  comment: String
});

module.exports = {
    userSchema: userSchema,
    rideSchema: rideSchema,
    reviewSchema: reviewSchema
};

/*exports.userSchema = userSchema;
exports.rideSchema = rideSchema;
exports.reviewSchema = reviewSchema;*/
