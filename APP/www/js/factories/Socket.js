(function () {
	'use strict';

	var app = angular.module('starter');

	app.factory('Socket', function (socketFactory, Config) {

		return socketFactory({
		    ioSocket: io.connect(Config.nodejsURL)
		  });
	});

})();