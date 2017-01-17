(function () {
	'use strict';

	var app = angular.module('starter');

	app.controller('WeatherCtrl', function ($rootScope, $scope, $state, $http, $interval, Socket, Config){
		console.info('WeatherCtrl --> LOADED');
				

		/********************************************************************************************/
		/********************************* SOCKET LISTENERS - START *********************************/



		/********************************** SOCKET LISTENERS - END **********************************/
		/********************************************************************************************/



		/********************************************************************************************/
		/********************************** PUBLIC METHODS - START **********************************/

		$scope.getWeather = function () {
			var url = 'http://api.wunderground.com/api/06d8e36ef998904e/conditions/forecast/q/Romania/Cluj-Napoca.json';

			$http
				.get(url)
				.then(
					function (weather) {
						console.log('weather: %O', weather.data);
						
						$scope.weather = {
							temperature: {
								now: weather.data.current_observation.temp_c,
								max: weather.data.forecast.simpleforecast.forecastday[0].high.celsius,
								min: weather.data.forecast.simpleforecast.forecastday[0].low.celsius
							},
							humidity: 		weather.data.current_observation.relative_humidity,
							pressure: 		weather.data.current_observation.pressure_mb,
							icon: 			weather.data.current_observation.icon,
							description: 	weather.data.current_observation.weather
						};

						console.log('Weather: %O', $scope.weather);
					},
					function(error) {
						console.warn('Weather ERROR: %O', error);
					}
				);
		};

		/*********************************** PUBLIC METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/********************************* PRIVATE METHODS - START **********************************/

		

		/********************************** PRIVATE METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/************************************ RUN ONLOAD - START ************************************/

		$scope.getWeather();

		$interval(function () {
			$scope.getWeather();
		}, 900000);

		/************************************* RUN ONLOAD - END *************************************/
		/********************************************************************************************/


	});

})();