// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var repetitionSchema = new Schema({
//     dailyDays:  {
//         type: [Boolean]
//     },
//     nbPerWeek: Number
// }, {
//     timestamps: true
// });

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
    positive: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Habits = mongoose.model('Habit', habitSchema);

// make this available to our Node applications
module.exports = Habits;