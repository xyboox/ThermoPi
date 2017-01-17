(function () {
	'use strict';

	var app = angular.module('starter');

	app.controller('DashCtrl', function ($rootScope, $scope, $state, $http, $interval, owm, $cordovaDevice, Socket, Config){
		console.info('DashCtrl --> LOADED');
				

		/********************************************************************************************/
		/********************************* SOCKET LISTENERS - START *********************************/

		Socket.on('handShake', function () {
            console.info('Socket (handShake) <-- RECEIVED');

            $rootScope.UUID = $cordovaDevice.getUUID();
			Socket.emit('user', $rootScope.UUID);
        });

		Socket.on('temperature', function (data) {
            console.info('Socket (temperature) <-- RECEIVED: %s', data.temperature);

            $scope.temperature = Number(data.temperature);
            $scope.mainTemp = $scope.temperature.toString().substr(0, 4);
            $scope.sideTemp = $scope.temperature.toString().substr(4, 1);
        });

        Socket.on('heatingStarted', function (data) {
            console.info('Socket (heatingStarted) <-- RECEIVED: %O', data);

            $scope.isHeating = true;
        });

        Socket.on('heatingStopped', function (data) {
            console.info('Socket (heatingStopped) <-- RECEIVED: %O', data);

            $scope.isHeating = false;
        });

        Socket.on('heatingStatus', function (data) {
            console.info('Socket (heatingStatus) <-- RECEIVED: %O', data);

            if (data === '0') {
            	$scope.isHeating = false;
            } else {
            	$scope.isHeating = true;
            }
        });

        Socket.on('desiredTemperatures', function (data) {
            console.info('Socket (desiredTemperatures) <-- RECEIVED: %O', data);

            $scope.desiredTemperature = data.desiredTemperature;
            $scope.desiredSubUnitTemperature = data.desiredSubUnitTemperature;

            $scope.totalDesiredTemperature = $scope.desiredTemperature + $scope.desiredSubUnitTemperature/10;
        });


        $rootScope.$on('pushRegistered', function (e, token) {
			console.log('pushRegistered event --> RECEIVED');

			$rootScope.pushToken = token;

			

			var obj = {
				uid: $rootScope.UUID,
				token: $rootScope.pushToken
			};
			console.log('obj: %O', obj);

			Socket.emit('pushIsRegistered', obj);
			console.info('Socket (pushIsRegistered) --> SENT');
		});

		/********************************** SOCKET LISTENERS - END **********************************/
		/********************************************************************************************/



		/********************************************************************************************/
		/********************************** PUBLIC METHODS - START **********************************/

		$scope.decreaseDesired = function () {
			console.log('totalDesiredTemperature is %s', $scope.totalDesiredTemperature);

			if ($scope.totalDesiredTemperature > 16) {
				if ($scope.desiredSubUnitTemperature === 0) {
					$scope.desiredSubUnitTemperature = 5;
					$scope.desiredTemperature--;
					$scope.totalDesiredTemperature = $scope.desiredTemperature + 0.5;
				} else if ($scope.desiredSubUnitTemperature === 5) {
					$scope.desiredSubUnitTemperature = 0;
					$scope.totalDesiredTemperature = $scope.desiredTemperature;
				}

				console.log('NEW totalDesiredTemperature is %s', $scope.totalDesiredTemperature);

				Socket.emit('setDesiredTemperatures', {
					desiredTemperature: $scope.desiredTemperature,
					desiredSubUnitTemperature: $scope.desiredSubUnitTemperature
				});

				if ($scope.temperature > $scope.totalDesiredTemperature) {
					Socket.emit('stopHeating');
				}
			}
		};

		$scope.increaseDesired = function () {
			console.log('totalDesiredTemperature is %s', $scope.totalDesiredTemperature);

			if ($scope.totalDesiredTemperature < 32) {
				if ($scope.desiredSubUnitTemperature === 0) {
					$scope.desiredSubUnitTemperature = 5;
					$scope.totalDesiredTemperature = $scope.desiredTemperature + 0.5;
				} else if ($scope.desiredSubUnitTemperature === 5) {
					$scope.desiredSubUnitTemperature = 0;
					$scope.desiredTemperature++;
					$scope.totalDesiredTemperature = $scope.desiredTemperature;
				}

				console.log('NEW totalDesiredTemperature is %s', $scope.totalDesiredTemperature);

				Socket.emit('setDesiredTemperatures', {
					desiredTemperature: $scope.desiredTemperature,
					desiredSubUnitTemperature: $scope.desiredSubUnitTemperature
				});

				if ($scope.temperature < $scope.totalDesiredTemperature) {
					Socket.emit('startHeating');
				}
			}
		};

		/*********************************** PUBLIC METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/********************************* PRIVATE METHODS - START **********************************/

		

		/********************************** PRIVATE METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/************************************ RUN ONLOAD - START ************************************/	

		Socket.emit('getDesiredTemperatures');
		Socket.emit('getHeatingStatus');

		/************************************* RUN ONLOAD - END *************************************/
		/********************************************************************************************/


	});

})();