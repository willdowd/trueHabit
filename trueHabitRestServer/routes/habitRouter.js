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

            }
        });

    })
    
});

habitRouter.route('/:habitid/statistic')

.get(function(req, res, next){
    Habits.findById(req.params.habitid, function(err, habit){
        if (err) next(err);
        console.log("get habit statistics - retrieved habit by id");
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
    console.log("POST STAT CALLED");
    Habits.findById(req.params.habitid,function(err, habit){
        if (err) next(err);
        habit.statistics.push(req.body);
        habit.save(function(err, habit){
            if (err) next(err);
            console.log("updated habit with new stat");
            res.json(habit);
        })
    });
});

habitRouter.route('/:habitid/statistic/:statdate')

.get(function(req, res, next){
    console.log("-- -- -- GET STAT CALLED: ",req.params.statdate);
    var cursor = Habits.findById(req.params.habitid)
    .populate('statistics')
    .cursor();

    cursor.next().then(function(habit){
        var found = false;

        for (var i = (habit.statistics.length - 1); i >= 0; i--) {
            if (habit.statistics[i].date.localeCompare(req.params.statdate) == 0){
                found = true;
                console.log("--- habit found: value: ",habit.statistics[i].value," and date: ",habit.statistics[i].date);
                res.json(habit.statistics[i]);
                i=0;
            }
        }
        if (!found)
        {
            console.log("STATISTIC NOT FOUND - ASSUMING 0 - ADDING STAT");
            var dateval = (req.params.statdate).toString();
            var newstat = {
                date: dateval,
                value: 0
            };
            habit.statistics.push(newstat);
            res.json(newstat);
            habit.save(function(err, habit){
                if (err) next(err);
                console.log("updated habit with new stat");
                // res.writeHead(200, {
                //     'Content-Type': 'text/plain'
                // });
                //res.write(newstat.value);
            });
        }
        }
        // var mastat = habit.statistics.statdate;
        // console.log("la stat a retourner: ",mastat);
        // res.json(habit.statistics[req.params.commentId]);
        // console.log("habit.statistic with right date: ",habit.statistics[statdate]);

    );

    // Habits.findById(req.params.habitid, function(err, habit){
    //     if (err) next(err);
    //     console.log("found the habit: ",habit);
    //     habit.statistics.
    // }

})

.put(function(req, res, next){
    console.log("-- -- -- PUT STAT CALLED: ",req.params.statdate," - new value: ",req.body.value);
    var cursor = Habits.findById(req.params.habitid)
    .populate('statistics')
    .cursor();

    cursor.next().then(function(habit){
        var found = false;

        for (var i = (habit.statistics.length - 1); i >= 0; i--) {
            if (habit.statistics[i].date.localeCompare(req.params.statdate) == 0){
                habit.statistics[i] = req.body;
                habit.save(function(err, habit){
                    if (err) next(err);
                    console.log("the stat has been updated and habit is saved");
                    res.json(req.body);
                });
                found = true;
                i=0;
            }
        }
        if (!found)
        {
            console.log("STATISTIC NOT FOUND - ASSUMING 0 - ADDING STAT");
            var dateval = (req.params.statdate).toString();
            var newstat = {
                date: dateval,
                value: 1
            };
            habit.statistics.push(newstat);
            res.json({value: 1});
            habit.save(function(err, habit){
                if (err) next(err);
                console.log("updated habit with new stat");
                // res.writeHead(200, {
                //     'Content-Type': 'text/plain'
                // });
                //res.write(newstat.value);
            });
        }
    });
});

// .post(function(req, res, next){
//     console.log("get specific");
//     var cursor = Habits.findById(req.params.habitid)
//     .populate('statistics')
//     .cursor();

//     cursor.next().then(function(habit){
//         console.log("habit retrieved from cursor: ",habit);
//         console.log("statdate param: ",req.params.statdate);
//         var found = false;

//         for (var i = (habit.statistics.length - 1); i >= 0; i--) {
//             console.log("habit.statistics[i].date: ",habit.statistics[i].date);
//             if (habit.statistics[i].date.localeCompare(req.params.statdate) == 0){
//                 console.log("FOUND THE STAT");
//                 var statval = habit.statistics[i].value;
//                 if (statval == 0)
//                 {
//                     habit.statistics[i].value
//                 }
//                 found = true;
//                 res.json(habit.statistics[i]);
//                 i=0;
//             }
//         }
//         if (!found)
//         {
//             console.log("STATISTIC NOT FOUND - ASSUMING 0 - ADDING STAT");
//             var dateval = (req.params.statdate).toString();
//             var newstat = {
//                 date: dateval,
//                 value: 0
//             };
//             habit.statistics.push(newstat);
//             res.json(newstat);
//             habit.save(function(err, habit){
//                 if (err) next(err);
//                 console.log("updated habit with new stat");
//             });
//         }
//         }
//     );
// });

module.exports = habitRouter; 






