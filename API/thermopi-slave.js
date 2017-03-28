(function () {
	'use strict';

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DEPENDENCIES - START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

	var Config = {
		httpPort: 11100,
		username: 'webiopi',
		password: 'raspberry',
		webiopiURL: '192.168.1.122:8003',
		location: 'Bedroom'
	};

	
	var temperature;
	var roundTemperature;


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
	/*var firebase = require("firebase");
	firebase.initializeApp({
		databaseURL: "https://thermopi-f0973.firebaseio.com/",
		serviceAccount: __dirname + "/credentials/ThermoPi.json"
	});
	var FBase = firebase.database();*/


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





	app.get('/test', function(req, res) {
		logger.info('EXPRESS: get("/test") --> RECEIVED'.event);

		var status, message, data;

		var params = req.body;

		logger.log('params:');
		logger.log('%O', params);

		data = {
			response: 'OK'
		};

		makeResponse(res, status, message, data);
	});





	app.post('/getTemperature', function(req, res) {
		logger.info('EXPRESS: post("/getTemperature") --> RECEIVED'.event);

		var status, message, data;

		var params = req.body;

		logger.log('params:');
		logger.log('%O', params);

		status = 1;
		data = {
			location: Config.location,
			temperature: roundTemperature
		};
		makeResponse(res, status, message, data);
	});





	

	// default route
	app.get('*', function(req, res) {
		logger.info('EXPRESS: get("*") --> RECEIVED'.event);

		res.set('Access-Control-Allow-Origin', '*');
        res.sendFile('./public/404.html', { root: __dirname }); 
    });


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ROUTES - END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ RUN THE SERVER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

	var server = http.createServer(app);

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

   	setInterval(function () {
   		getTemperature();
   	}, 10000);

	/*---------------------------------------------------------------------------------------------------*/







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

    function getTemperature () {
    	var temperatureURL = Config.apiURL + '/devices/temp0/sensor/temperature/c';

    	request(
		    {
		        url : temperatureURL
		    },
		    function (error, response, body) {
		    	if (error) {
		    		logger.log('WebIOPi getTemp error: %O', error);
		    		return;
		    	}

		    	temperature = body;

		        logger.info('Temperature: %s', temperature);

		        roundTemperature = Math.round(temperature*10)/10;
		        logger.info('roundTemperature: %s', roundTemperature);
		    }
		);
    }
    
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRIVATE METHODS - END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

})();