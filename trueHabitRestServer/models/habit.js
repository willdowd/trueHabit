// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statisticSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});

// create a schema
var habitSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    daily: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    statistics: [statisticSchema]
    //statistic: {type: Object, default: {}}
    // statistic: [{
    //     statDate: Date,
    //     statVal: Number
    // }]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Habits = mongoose.model('Habit', habitSchema);

// make this available to our Node applications
module.exports = Habits;