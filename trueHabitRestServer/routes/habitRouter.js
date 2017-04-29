var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Habits = require('../models/habit');
var Users = require('../models/user');
var Verify = require('./verify');

var ObjectID = require('mongodb').ObjectID;

var habitRouter = express.Router();

habitRouter.use(bodyParser.json());


// habitRouter.route('/')
// .get(function (req, res, next) {
//     Habits.find(req.query)
//         .exec(function (err, habit) {
//           if (err) next(err);
//           res.json(habit);
//     });
// })

// .post(function (req, res, next) {
//     Habits.create(req.body, function (err, habit) {
//         if (err) next(err);
//         console.log('Habit created!');
//         res.writeHead(200, {
//             'Content-Type': 'text/plain'
//         });
//     });
// })

// .post(function (req, res, next) {
//     //req.body.owner = req.decoded._id;
//     Habits.create(req.body, function (err, habit) {
//         if (err) next(err);
//         console.log('Habit created, now updating owner!');
//         // Users.findById(req.decoded._id)
//         //     .exec(function(err, theuser){
//         //         if(err) next(err);
//         //         console.log('Found the User by Id!');
//                 //var id = habit._id;
//                 //theuser.habits.push(id);
//                 res.writeHead(200, {
//                     'Content-Type': 'text/plain'
//                 });
//                 //res.end('Added the habit with id: ' + id);
//         //}); 
//     });
// })

// .delete(function (req, res, next) {
//     Habits.findByIdAndRemove(req.params.username, function (err, resp) {
//         if (err) next(err);
//         res.json(resp);
//     });
// })
;

habitRouter.route('/:userid')

.get(function (req, res, next) {
    // Users.findById(req.params.userid,{habits:1},function(err, thehabits){
    //     if(err) next(err);
    //     console.log('try to fetch habits - User found by id');

    //     // var cursor = thehabits.cursor();
    //     // cursor.next(function(error, doc){
    //         // console.log("this is the doc in the users array of habits",doc);
    //     });
    // })
    Users.findById(req.params.userid, {habits:1}).stream()
    .on('data', function(doc){
        console.log("there i have a hold of the doc in the stream", doc);
        var thehabits = doc.habits;
        var thehabitsarray = [];
        console.log("check what doc habits look like: ",thehabits);
        thehabits.forEach(function(habit_id){
            console.log("for each: ",habit_id);
            Habits.findById(habit_id, function(err, thehabit){
                if (err) next(err);
                thehabitsarray.push(thehabit);
                console.log("thehabit ",thehabit);
            });
        });
        console.log("thehabitsarray looks like that at the end: ",thehabitsarray);
        res.json(thehabitsarray);
    });


    // Habits.findById({username : req.params.userid})
    //     .exec(function (err, habit) {
    //     if (err) next(err);
    //     res.json(habit);
    // });
})

.post(function (req, res, next) {
    Habits.create(req.body, function (err, habit) {
        if (err) next(err);
        console.log('Habit created, now updating owner!');
        Users.findById(req.params.userid, function(err, theuser){
                if(err) next(err);
                console.log('Found the User by Id!');
                var id = habit._id;
                theuser.habits.push(new ObjectID(id));
                theuser.save(function(err){
                    if (err) next(err);
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Added the habit with id: ' + id);
                });
        });
    });
});

habitRouter.route('/fromhabit/:habitid')

.delete(function (req, res, next) {
    Habits.findByIdAndRemove(req.params.habitid, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});


module.exports = habitRouter; 






