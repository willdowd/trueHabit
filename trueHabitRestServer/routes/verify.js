var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user) {
    console.log("getToken");
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    console.log("verifyOrdinaryUser");
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    console.log("req.body.token: ",req.body.token);
    console.log("req.query.token: ",req.query.token);
    console.log(req.headers['x-access-token']);
    //console.log(token);
    // decode token
    if (token) {
        // verifies secret and checks exp
        console.log("token found!");
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                console.log("You are not authenticated!");
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                console.log("everything looks good you are authenticated");
                req.decoded = decoded;
                next();
            }
        });
    } else {
        console.log("in the else, token not there");
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = function(req,res,next){
    console.log("verifyAdmin");
    if(!req.decoded) {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    } else {
        var id = req.decoded._id;
        if(!req.decoded.admin){
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        } else
        next();
    }

    // if(req.decoded._doc.admin === true)  {
    //     next();
    // }
    // else {
    //     var err = new Error('You are not authorized to perform this operation!');
    //     err.status = 403;
    //     return next(err);
    // }
};