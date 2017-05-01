var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Habits = require('../models/habit');
var Users = require('../models/user');
var Verify = require('./verify');

var ObjectID = require('mongodb').ObjectID;

var habitRouter = express.Router();

habitRouter.use(bodyParser.json());

habitRouter.route('/:userid')

.get(function (req, res, next) {
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
})

.post(function (req, res, next) {
    //var todaydate = new Date();
    //req.body.statistic[todaydate] = 0;
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
                    // res.writeHead(200, {
                    //     'Content-Type': 'text/plain'
                    // });
                    //res.end('Added the habit with id: ' + id);
                    res.json(habit);
                });
        });
    });
});

habitRouter.route('/:userid/removehabit/:habitid')

.delete(function (req, res, next) {
    var thegoalid = -1;
    Users.findById(req.params.userid)
    .populate('habits')
    .exec(function(err, theuser){
        if (err) next(err);
        

        console.log("habits: ",theuser.habits);
        theuser.habits.forEach(function(elm,idx){
            if (elm._id==req.params.habitid){
                thegoalid = idx;
                console.log("thegoalid: ",thegoalid);
                theuser.habits[idx].remove();
                theuser.habits.splice(idx,1);
                theuser.save(function (err, resp) {
                    if (err) next(err);
                    res.json(resp);
                });
                
                // Users.findById(req.params.userid, function(err, theusertwo){
                //     if (err) next(err);
                //     console.log("habits usertwo: ",theusertwo.habits);
                //     theusertwo.habits.splice(thegoalid,1);

                //     Users.findById(req.params.userid, function(err, theuserthree){
                //     if (err) next(err);
                //     console.log("habits userthree: ",theuserthree.habits);

                    
                    
                // });

                // });


            }
        });


    })
    
});

// habitRouter.route('/:habitid')

// .delete(function (req, res, next) {
//     Habits.findByIdAndRemove(req.params.habitid, function (err, resp) {
//         if (err) next(err);

//         res.json(resp);
//     });
// });

habitRouter.route('/:habitid/stat')

.get(function(req, res, next){
    Habits.findById(req.params.habitid, function(err, habit){
        if (err) next(err);
        console.log("get habit stat - retrieved habit by id");
        console.log("return the stats: ",habit.statistic);
        if (habit.statistic.length != 0)
            res.json(habit.statistic);
        else{
            var date = new Date();
            habit.statistic[date] = 0;
            res.json(undefined);
        }
    })
})

.post(function(req, res, next){
    console.log("in post habit stat with stat date and stat body");
    Habits.findById(req.params.habitid,function(err, habit){
        if (err) next(err);
        console.log("found the habit: ",habit);
        console.log("now pushing the stat");
        console.log("with statdate: ",req.body.statdate);
        console.log("with statval: ", req.body.statval);
        habit.statistics.push(req.body);
        habit.save(function(err, habit){
            if (err) next(err);
            console.log("updated habit with new stat");
            res.json(habit);
        })
    });
});

//habitRouter.route('/:habitid/stat/:statdate')

//.post(function(req, res, next){
    // console.log("in post habit stat with stat date and stat body");
    // Habits.findById(req.params.habitid,function(err, habit){
    //     if (err) next(err);
    //     console.log("found the habit: ",habit);
    //     console.log("now pushing the stat");
    //     console.log("with statdate: ",req.body.statdate);
    //     console.log("with statval: ", statval);
    //     habit.statistics.push(req.body);
    //     habit.save(function(err, habit){
    //         if (err) next(err);
    //         console.log("updated habit with new stat");
    //         res.json(habit);
    //     })
    // });
//});

//     Habits.findById(req.params.habitid, function(err, habit){
//         if (err) next(err);
//         console.log("post habit stat - retrieved habit by id");
//         console.log("the map first looks like: ",habit.statistic);
//         var val = habit.statistic[req.params.statdate];
//         console.log("the value read in statistic is: ",val);
//         var newval = 0;
//         if(val == 0){newval = 1;}
//         console.log("the value of the newval is: ",newval);
//         habit.statistic[req.params.statdate] =  0 ;

//         habit.markModified('statistic');
//         habit.save(function(err){
//             if(err) next(err);
//         });
//         console.log("the map now looks like: ",habit.statistic);
//     })
// });

module.exports = habitRouter; 






