(function () {
	'use strict';

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DEPENDENCIES - START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

	var Config = {
		httpPort: 11000,
		username: 'webiopi',
		password: 'raspberry',
		webiopiURL: 'xyboox.go.ro:8000'
	};

	// pmx
	var pmx = require('pmx');
	pmx.init();

	var temperature;
	var timer = 0;
	var timerSet = 0;
	var sockets = [];
	var desiredTemperature = 10;
	var heatingStatus = false;
	var countT = 0;
	var operationPending = false;
	var startTime, stopTime, interval;

	
	// http
	var http = require('http');


	//debugging
	var colors = require('colors');
	colors.setTheme({
		info: 'green',
		data: 'magenta',
		warn: 'yellow',
		error: 'red',
		event: 'cyan',
		receivedEvent: 'lightcyan'
	});


	//util
	var util = require('util');
	var fs = require('fs');


	//inspector
	var inspector = require('schema-inspector');


	// push
	var gcm = require('node-gcm');
	var retry_times = 4; //the number of times to retry sending the message if it fails
    var sender = new gcm.Sender('AIzaSyAtFMu5FW-iNXmu14SbP6ZGVRremFt5tiw'); //create a new sender
    var message = new gcm.Message(); //create a new message


	// multipart ( for file upload )
	var multipart = require('connect-multiparty');
	var multipartMiddleware = multipart();
	var multiparty = require('multiparty');


	//trace
	var logger = require('tracer').colorConsole({
		format : [
			'{{timestamp}} (in line: {{line}}) >> {{message}}', //default format
			{
				error : '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}' // error format
			} 
		],
		dateformat : 'HH:MM:ss.L',
		preprocess :  function(data){
			data.title = data.title.toUpperCase();
		}
	});



	//firebase
	var firebase = require("firebase");
	firebase.initializeApp({
		databaseURL: "https://thermopi-f0973.firebaseio.com/",
		serviceAccount: __dirname + "/credentials/ThermoPi.json"
	});
	var FBase = firebase.database();


	//request
	var request = require('request');
	Config.apiURL = "http://" + Config.username + ":" + Config.password + "@" + Config.webiopiURL;


	//express
	var express = require('express');
	var morgan = require('morgan');             
    var bodyParser = require('body-parser');

	var app = express();
	app.use(express.static(__dirname + '/public')); 
	app.use(morgan('dev'));
    app.use(bodyParser.json({limit: "50mb", type:'application/json'}));
	app.use(bodyParser.urlencoded({limit: '50mb', 'extended': true, type:'application/x-www-form-urlencoding'}));


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DEPENDENCIES - END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/




   
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ROUTES - START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Cache-Control');
		if (req.method === 'OPTIONS') {
			res.statusCode = 204;
			return res.end();
		} else {
			return next();
		}
	});





	app.post('/test', function(req, res) {
		logger.info('EXPRESS: post("/test") --> RECEIVED'.event);

		var status, message, data;

		var params = req.body;

		logger.log('params:');
		logger.log('%O', params);

		makeResponse(res, status, message, data);
	});





	app.post('/createTempUser', function(req, res) {
		logger.info('EXPRESS: post("/createTempUser") --> RECEIVED'.event);

		var status, message, data;

		var schema = {
		    type: 'object',
		    properties: {
		        name: {  
		        	type: 'string'
		        }
    		}
		};

		var params = req.body;
		logger.log('params: %O', params);

		var validationresult = inspector.validate(schema, params);

		if (!validationresult.valid){
			// INVALID
			status = 0;
			message = validationresult.format();
			logger.log(validationresult.format());
			makeResponse(res, status, message, data);
		} else {
			logger.info('Validation passed');

			
		}	
	});


	


	// default route
	app.get('*', function(req, res) {
		logger.info('EXPRESS: get("*") --> RECEIVED'.event);

		res.set('Access-Control-Allow-Origin', '*');
        res.sendFile('./public/404.html', { root: __dirname }); 
    });

    app.use(pmx.expressErrorHandler());

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ROUTES - END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ RUN THE SERVER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

	var server = http.createServer(app);

	var io = require('socket.io')(server);

	server.listen(Config.httpPort, function () {

		console.log(' ');
		console.log(' ');
		console.log(' ');
		console.log(' ');
		console.log(' ');
		console.log('                                |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|'.error);
		console.log('                                |~~~~~~~~~~~~~~~~~~~ '.error + 'SERVER READY'.info + ' ~~~~~~~~~~~~~~~~~~~~|'.error);
	    console.log('                                |~~~~~~~~~~~ '.error + 'App listening on port '.event + Config.httpPort + ' ~~~~~~~~~~~~~|'.error);
	    console.log('                                |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|'.error);
	    console.log('                                |~~~~'.error + ' TDEQC MMWCS RAVAH LMARI YPEMQ ECKRQ CBLST A '.warn + '~~~~|'.error);
	    console.log('                                |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|'.error);
	    console.log(' ');                                                                                     
	    console.log(' ');
	    console.log(' ');                   
		console.log('   8888888888                   d8b                                                 888      888                  ');
		console.log('   888                          Y8P                                                 888      888                  ');
		console.log('   888                                                                              888      888                  ');
		console.log('   8888888    88888b.   .d88b.  888 88888b.   .d88b.   .d88b.  888d888 .d88b.   .d88888      88888b.  888  888    ');
		console.log('   888        888 "88b d88P"88b 888 888 "88b d8P  Y8b d8P  Y8b 888P"  d8P  Y8b d88" 888      888 "88b 888  888    ');
		console.log('   888        888  888 888  888 888 888  888 88888888 88888888 888    88888888 888  888      888  888 888  888    ');
		console.log('   888        888  888 Y88b 888 888 888  888 Y8b.     Y8b.     888    Y8b.     Y88b 888      888 d88P Y88b 888    ');
		console.log('   8888888888 888  888  "Y88888 888 888  888  "Y8888   "Y8888  888     "Y8888   "Y88888      88888P"   "Y88888    ');
		console.log('                            888                                                                            888    ');
		console.log('                       Y8b d88P                                                                       Y8b d88P    ');
		console.log('                        "Y88P"                                                                         "Y88P"     ');
		console.log('                                      888    8888888b.           .d888 888                                            ');
		console.log('                                      888    888   Y88b         d88P"  888                                            ');
		console.log('                                      888    888    888         888    888                                            ');
		console.log('       d8b d8b      .d8888b   .d88b.  888888 888   d88P .d88b.  888888 888  .d88b.  888  888      d8b d8b             ');
		console.log('       Y8P Y8P      88K      d8P  Y8b 888    8888888P" d8P  Y8b 888    888 d8P  Y8b `Y8bd8P\'      Y8P Y8P             ');
		console.log('                    "Y8888b. 88888888 888    888 T88b  88888888 888    888 88888888   X88K                            ');
		console.log('       d8b d8b           X88 Y8b.     Y88b.  888  T88b Y8b.     888    888 Y8b.     .d8""8b.      d8b d8b             ');
		console.log('       Y8P Y8P       88888P\'  "Y8888   "Y888 888   T88b "Y8888  888    888  "Y8888  888  888      Y8P Y8P             ');
		console.log(' ');
		console.log(' ');
		console.log(' ');
		                                                                                                     
	});

	setPinAsOutput();

   	setInterval(function () {
   		getTemperature();
   	}, 10000);

	/*---------------------------------------------------------------------------------------------------*/






	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SOCKET EVENTS - START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

	io.on('connection', function(socket){
		logger.info('User connected. Socket.id: %s'.info, socket.id);
		sockets.push(socket);

		socket.emit('handShake');

		socket.emit('temperature', {temperature: temperature});


		socket.on('test', function (user) {
			logger.info('Socket (test) <-- RECEIVED '.event);
		});


		socket.on('ping', function (user) {
			logger.info('Socket (ping) <-- RECEIVED '.event);

			socket.emit('ping', {status: true});
		});


		socket.on('user', function (uuid) {
			logger.info('Socket (user) <-- RECEIVED '.event);

			FBase.ref('users/' + uuid).once('value', function (snapshot) {
				var user = snapshot.val();

				if (!user) {
					FBase.ref('users/' + uuid).set({
						uid: uuid
					});
				}
			});
		});


		socket.on('pushIsRegistered', function (data) {
			logger.info('Socket (pushIsRegistered) <-- RECEIVED: '.event);

			FBase.ref('users/' + data.uid + '/pushTokens').once('value', function (snapshot) {
				var tokens = snapshot.val();

				var flag = false;

				for (var t in tokens) {
					if (tokens[t] == data.token) {
						flag = true;
						break;
					}
				}

				if (!flag) {
					FBase.ref('users/' + data.uid + '/pushTokens').push(data.token, function (err) {
						if (err) {
							logger.info('Push token ERROR: %O', err);
						}
					});
				}
			});
		});


		socket.on('getHeatingStatus', function () {
			logger.info('Socket (getHeatingStatus) <-- RECEIVED: '.event);

			if (heatingStatus) {
				socket.emit('heatingStatus', '1');
			} else {
				socket.emit('heatingStatus', '0');
			}
		});


		socket.on('setDesiredTemperature', function (data) {
			logger.info('Socket (setDesiredTemperature) <-- RECEIVED: %s'.event, data);

			desiredTemperature = data;
			io.sockets.emit('desiredTemperature', desiredTemperature);
		});


		socket.on('getDesiredTemperature', function () {
			logger.info('Socket (getDesiredTemperature) <-- RECEIVED: '.event);

			socket.emit('desiredTemperature', desiredTemperature);
		});


		socket.on('getData', function (date) {
			logger.info('Socket (getData) <-- RECEIVED:'.event);
			logger.info('%O', date);

			var year = date.year;
			var month = getNiceMonth(date.month);
			var day = date.day;

			FBase.ref('temperatures/' + year + '/' + month + '/' + day).once('value', function (snapshot) {
				var temps = snapshot.val();

				var data = newEmptyData();

				for (var t in temps) {
					var h = extractHour(temps[t].timestamp);
					var temp = Number(temps[t].temperature);
					data[h][0]++;
					data[h][1] += temp;
				}

				logger.info('today\'s temperatures:');
				logger.info('%O', data);

				var results = [];
				for (var d in data) {
					results[d] = data[d][1] / data[d][0] || 0;
				}

				FBase.ref('running/' + year + '/' + month + '/' + day).once('value', function (snapshot) {
					var hours = snapshot.val();

					var data = newEmptyRunningsArr();

					for (var d in data) {
						for (var h in hours) {
							if (d == h) {
								data[h] = hours[h];
							}
						}
					}	

					var rs = {
						temperatures: results,
						runnings: data
					};

					socket.emit('data', rs);
				});
			});

		});


		socket.on('setTimer', function (data) {
			logger.info('Socket (setTimer) <-- RECEIVED: %s'.event, data);

			console.log('temperature now: %s', temperature);
			console.log('desiredTemperature now: %s', desiredTemperature);

			timer = data * 60;
			timerSet = data;

			io.sockets.emit('startTimer', timer);

			var timerInterval = setInterval(function () {
				if (desiredTemperature <= temperature) {
					desiredTemperature = Math.ceil(temperature) + 5;
					socket.emit('desiredTemperature', desiredTemperature);
				}

				timer--;

				if (timer <= 0) {
					timerSet = 0;
					clearInterval(timerInterval);
					desiredTemperature = Math.floor(temperature) - 5;
					socket.emit('desiredTemperature', desiredTemperature);
					io.sockets.emit('stopTimer');
				}
			}, 1000);
		});


		socket.on('getTimer', function () {
			logger.info('Socket (getTimer) <-- RECEIVED'.event);

			socket.emit('timer', timer, timerSet);
		});


		
		


		/**********************************************************************************************/
		socket.on('disconnect', function () {
			logger.info('User %s DISCONNECTED'.error, socket.id);

			for (var i = 0; i < sockets.length; i++) {
				if (sockets[i].id == socket.id) {
					sockets.splice(i, 1);
					break;
				}
			}
		});
		/**********************************************************************************************/

	});

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SOCKET EVENTS - END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/








	/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRIVATE METHODS - START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    function makeResponse (res, status, message, data) {
		res.set('Access-Control-Allow-Origin', '*');
    	res.status(200).json({
    		status: status,
    		message: message,
    		data: data
    	});
    }

    function extractHour (timestamp) {
    	var d = new Date(timestamp);
    	var h = d.getHours();
    	return h;
    }

    function newEmptyData () {
    	var arr = [];

    	for (var i = 0; i < 24; i++) {
    		arr[i] = [0, 0];
    	}

    	return arr;
    }

    function getTemperature () {
    	var temperatureURL = Config.apiURL + '/devices/temp0/sensor/temperature/c';

    	request(
		    {
		        url : temperatureURL
		    },
		    function (error, response, body) {
		    	if (error) {
		    		logger.log('WebIOPi getTemp error: %O', error);
		    	}

		    	temperature = body;

		        logger.info('Temperature: %s', temperature);

		        var roundTemperature = Math.round(temperature*10)/10;
		        logger.info('roundTmperature: %s', roundTemperature);


		        var d = new Date();
		        var year = d.getFullYear();
		        var month = getNiceMonth(d.getMonth());
		        var day = d.getDate();
		        var timestamp = d.getTime();

		        var entry = {
		        	timestamp: timestamp,
		        	temperature: temperature
		        };

		        countT++;
		        if (countT === 60) {
		        	FBase.ref('temperatures/' + year + '/' + month + '/' + day).push(entry);
		        	countT = 0;
		        }

		        io.sockets.emit('temperature', {temperature: roundTemperature});

		        if (roundTemperature) {
		        	if (roundTemperature >= desiredTemperature) {
			        	if (heatingStatus && !operationPending) {
			        		logger.info('Have a temp of ' + roundTemperature + ' and requested one of ' + desiredTemperature);

			        		var url = Config.apiURL + '/GPIO/17/value/1';
							request.post({
								headers: {'content-type' : 'application/x-www-form-urlencoded'},
								url:     url,
								body:    ""
							}, function(error, response, body){
								if (error) {
									logger.info(url + ': ERROR: %O', error);
								} else {
									logger.log('heatingStatus is now %s', body);

									io.sockets.emit('heatingStopped', body);
									heatingStatus = false;

									clearInterval(interval);
								}
								operationPending = false;
								io.sockets.emit('pleaseWait', false);
							});
							operationPending = true;
							io.sockets.emit('pleaseWait', true);
			        	}
			        } else {
			        	if (!heatingStatus && !operationPending) {
			        		logger.info('Have a temp of ' + temperature + ' and requested one of ' + desiredTemperature);

			        		var url = Config.apiURL + '/GPIO/17/value/0';
							request.post({
								headers: {'content-type' : 'application/x-www-form-urlencoded'},
								url:     url,
								body:    ""
							}, function(error, response, body){
								if (error) {
									logger.info(url + ': ERROR: %O', error);
								} else {
									logger.log('heatingStatus is now %s', body);

									io.sockets.emit('heatingStarted', body);
									heatingStatus = true;

									sendPush();

									interval = setInterval(function () {
										var d = new Date();
										var year = d.getFullYear();
										var month = getNiceMonth(d.getMonth());
										var day = d.getDate();
										var hour = d.getHours();
										
										addMinuteToRunning(year, month, day, hour);
									}, 60000);
								}
								operationPending = false;
								io.sockets.emit('pleaseWait', false);
							});
							operationPending = true;
							io.sockets.emit('pleaseWait', true);
			        	}
			        }
		        }
		    }
		);
    }

    function addMinuteToRunning (year, month, day, hour) {
    	FBase.ref('running/' + year + '/' + month + '/' + day + '/' + hour).transaction(function (minutes) {
    		return minutes + 1;
    	});
    }

    function setPinAsOutput () {
    	var temperatureURL = Config.apiURL + '/devices/temp0/sensor/temperature/c';

    	var url = Config.apiURL + '/GPIO/17/function/out';
		request.post({
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url:     url,
			body:    ""
		}, function(error, response, body){
			logger.log('Heating function status: %s', body);

			var url = Config.apiURL + '/GPIO/17/value/1';
			request.post(
			    {
			        headers: {'content-type' : 'application/x-www-form-urlencoded'},
					url:     url,
					body:    ""
			    },
			    function (error, response, body) {
			        var url = Config.apiURL + '/GPIO/17/value';
					request(
					    {
					        url : url
					    },
					    function (error, response, body) {
					        logger.info('Initial Heating status: %s', body);
					        
					        if (body === '1') {
					        	heatingStatus = false;
					        } else {
					        	heatingStatus = true;
					        }
					    }
					);
			    }
			);
		});
    }

    function sendPush () {
		FBase.ref('users').once('value', function (snapshot) {
			var users = snapshot.val();

			var usersToBeNotied = [];

			for (var u in users) {
				for (var p in users[u].pushTokens) {
					usersToBeNotied.push(users[u].pushTokens[p]);
				}
			}

		    message.addData('title', 'ThermoPi');
		    message.addData('message', 'A pornit centrala termica!');
		    message.addData('sound', 'notification');
		    message.addData('image', 'icon');

		    message.collapseKey = 'testing'; //grouping messages
		    message.delayWhileIdle = true; //delay sending while receiving device is offline
		    message.timeToLive = 3; //the number of seconds to keep the message on the server if the device is offline

		    console.log('usersToBeNotied: %O', usersToBeNotied);

		    sender.send(message, usersToBeNotied, retry_times, function(result){
		        console.log('Push result: ' + result);
		    });

			console.log('Push SENT!');
		});
	}

	function getNiceMonth (month) {
   		var months = [
   			'January',
   			'February',
   			'March',
   			'April',
   			'May',
   			'June',
   			'July',
   			'August',
   			'September',
   			'October',
   			'November',
   			'December'
   		];

	   	var niceMonth = months[month];
	   	return niceMonth;
   	}

   	function newEmptyRunningsArr () {
   		var data = [];

   		for (var i = 1; i <= 24; i++) {
   			data.push(0);
   		}

   		return data;
   	}
    
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRIVATE METHODS - END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

})();