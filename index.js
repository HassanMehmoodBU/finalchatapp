var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbURL),
    passport = require('passport'),
    facebookStrategy = require('passport-facebook').Strategy,
    rooms = []

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
	// dev mode
	app.use(session({secret: config.sessionSecret,
	saveUninitialized:true,
	resave:true,
}));
}else{
	//pro 
	app.use(session({
		secret:config.sessionSecret,
		saveUninitialized:true,
		resave:true,
		store : new ConnectMongo({
			url:config.dbURL,
			stringify:true 
		}) 
	
}))
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportauth.js')(passport, facebookStrategy, config, mongoose);

require('./routes/routes.js')(express, app, passport, config, rooms);

//app.listen(3000, function(){
//	console.log('Chatcat working at 3000');
//	console.log('Mode: ' + env);

app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function(){
	console.log('Chatcat on port :'+ app.get('port'));

}) 

