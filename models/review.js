/**
  * Review: An opinion, on a subject
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;

var Review = new Schema({
    content: {type: String, default: '', required: true},
    title: {type: String},
    reviewerId: {type: String},
    subjectId: {type: String, required: true},
    link: {type: String},
    rating: {type: Number, default: 0.0, min: 0.0, max: 10.0},
    utilityRating: {type: Number, min: 0.0, max: 10.0},
    dateOfService: { type: Date, default: Date.now }
});
Review.plugin(createdModifiedPlugin, {index: true});
module.exports = mongoose.model('Review', Review);
