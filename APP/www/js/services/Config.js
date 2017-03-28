(function () {
	'use strict';

	var app = angular.module('starter');

	app.service('Config', function () {

		return {
			apiURL: 'http://xyboox.go.ro/gpio.php',
			nodejsURL: 'http://xyboox.go.ro:11000',
			sensors: [
				'http://192.168.1.122:11100/'
			]
		};

	});
	
})();