// -------------------------------------------------- //
// Module Dependencies
// -------------------------------------------------- //
var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var path = require('path');
var config = require('./config.js');              // Get our config info (app id and app secret)
var sys = require('util');


var app = express();


// -------------------------------------------------- //
// Express set-up and middleware
// -------------------------------------------------- //
app.set('port', config.PORT || 80);
// app.use(express.favicon());      // must install if we need
app.use(cookieParser());                                    // cookieParser middleware to work with cookies
// app.use(express.session({ secret: config.EXPRESS_SESSION_SECRET }));   // must install if we need
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));        // this was in the example



// -------------------------------------------------- //
// Variables
// -------------------------------------------------- //
var _mshAppID = config.MSHEALTH_CLIENT_ID;
var _mshAppSecret = config.MSHEALTH_CLIENT_SECRET;
var _mshRedirectURL = config.MSHEALTH_REDIRECT_URL;
var _mshAuthCode;                                                 // this will hold our code once we authorize user


// -------------------------------------------------- //
// Routes
// -------------------------------------------------- //

// this is the route to which MSH API calls back
app.get('/redirect', function(req, res) {

  // get our authorization code
  _mshAuthCode = req.query.code;
  
  // console.log("MSH API Authorization Code:  " + _mshAuthCode);
  console.log("Redirecting...");

  // set-up an object to use for our POST to MSH API for the authorization token
  var requestObject = {
      'client_id': _mshAppID,
      'redirect_uri': _mshRedirectURL,
      'client_secret': _mshAppSecret,
      'code': _mshAuthCode,
      'grant_type': 'authorization_code'
  };

  var msh_token_request_header = {
    'Content-Type': 'application/x-www-form-urlencoded'  
  };
  
  // var oauth_request_headers = {
  //   'Authorization': 'Client ' + _mshAppSecret,
  //   'Accept': 'application/json',
  //   'Content-Type': 'application/json'
  // };


  var options = {
    method: 'POST',
    url: 'https://login.live.com/oauth20_token.srf',
    headers: msh_token_request_header,
    form: requestObject
  };

  request(options, function (error, response, body) {
    if (!error) {
      // console.log('Our body is: ' + body);
      
      body = JSON.parse(body);
      
      var accessToken = body.access_token;
      // console.log('accessToken: ' + accessToken);
      
      res.cookie('accessToken', accessToken, { });
      res.redirect('/mshWDC.html');
    } else {
      console.log(error);
    }
  });
});


// -------------------------------------------------- //
// Create and start our server
// -------------------------------------------------- //
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});