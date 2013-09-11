/**
  * Subject: A noun, to be reviewed
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;

var Subject = new Schema({
    name: {type: String, default: '', required: true},
    description: {type: String},
    planId: {type: String},
    email: {type: String, required: true},
    link: {type: String},
    phone: {type: String},
    streetAddress: {type: String},
    postalCode: {type: String},
    state: {type: String},
    country: {type: String, default: 'United States'},
    password: {type: String},
    approvedHosts: {type: String},
    image: {type: String, default: ''},
    accountId: {type: String, required: true},
    discoverable: {type: Boolean, default: false}
});
Subject.plugin(createdModifiedPlugin, {index: true});
module.exports = mongoose.model('Subject', Subject);
