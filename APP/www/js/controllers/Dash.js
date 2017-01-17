(function () {
	'use strict';

	var app = angular.module('starter');

	app.controller('DashCtrl', function ($rootScope, $ionicSlideBoxDelegate, $scope, $state, $http, $timeout, $ionicLoading, $interval,  $cordovaDevice, Socket, Config){
		console.info('DashCtrl --> LOADED');
				

		/********************************************************************************************/
		/********************************* SOCKET LISTENERS - START *********************************/

		Socket.on('handShake', function () {
            console.info('Socket (handShake) <-- RECEIVED');

            $timeout(function () {
            	console.log('$rootScope.UUID = %s', $rootScope.UUID);
            	Socket.emit('user', $rootScope.UUID);
            }, 1000);
        });

		Socket.on('temperature', function (data) {
            console.info('Socket (temperature) <-- RECEIVED: %s', data.temperature);

            $scope.temperature = Number(data.temperature);
            $scope.mainTemp = Math.round($scope.temperature*10)/10;
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

        Socket.on('desiredTemperature', function (data) {
            console.info('Socket (desiredTemperature) <-- RECEIVED: %O', data);

            $scope.desiredTemperature = data;
            $scope.slider.value = data;
        });

        Socket.on('startTimer', function (data) {
            console.info('Socket (startTimer) <-- RECEIVED');

            $scope.countdownSeconds = data;
            $scope.timerInterval = $interval(function () {
            	$scope.countdownSeconds--;
            	$scope.timeLeft = $scope.digitFormat(Math.floor($scope.countdownSeconds / 60)) + ':' + $scope.digitFormat($scope.countdownSeconds%60);
            }, 1000);
        });

        Socket.on('stopTimer', function (data) {
            console.info('Socket (stopTimer) <-- RECEIVED');

            $interval.cancel($scope.timerInterval);
            $scope.timer = 0;
            $scope.timeLeft = '';
        });

         Socket.on('timer', function (timer, timerSet) {
            console.info('Socket (timer) <-- RECEIVED: %s / %s', timer, timerSet);
            $scope.timer = timerSet;

            if (timer > 0) {
            	$interval.cancel($scope.timerInterval);
            	$scope.countdownSeconds = timer;

	            $scope.timerInterval = $interval(function () {
	            	$scope.countdownSeconds--;
	            	$scope.timeLeft = $scope.timeLeft = $scope.digitFormat(Math.floor($scope.countdownSeconds / 60)) + ':' + $scope.digitFormat($scope.countdownSeconds%60);
	            }, 1000);
            }
        });

        Socket.on('pleaseWait', function (data) {
            console.info('Socket (pleaseWait) <-- RECEIVED');

            if (data) {
            	$ionicLoading.show({
					template: 'please wait...'
				});
            } else {
            	$ionicLoading.hide();
            }
        });


        $rootScope.$on('pushRegistered', function (e, token) {
			console.log('$rootScope.pushRegistered event --> RECEIVED');

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

		$scope.digitFormat = function (digit) {
			if (digit.toString().length == 1) {
				return '0' + digit;
			} else {
				return digit;
			}
		};

		$scope.decreaseDesired = function () {
			console.log('OLD desiredTemperature is %s', $scope.desiredTemperature);

			if ($scope.desiredTemperature > 16) {
				$scope.desiredTemperature -= 0.5;
				console.log('NEW desiredTemperature is %s', $scope.desiredTemperature);
				Socket.emit('setDesiredTemperature', $scope.desiredTemperature);
			}
		};

		$scope.increaseDesired = function () {
			console.log('OLD desiredTemperature is %s', $scope.desiredTemperature);

			if ($scope.desiredTemperature < 32) {
				$scope.desiredTemperature += 0.5;
				console.log('NEW desiredTemperature is %s', $scope.desiredTemperature);
				Socket.emit('setDesiredTemperature', $scope.desiredTemperature);
			}
		};

		$scope.runTimer = function (timer) {
			console.log('Timer set to %s', timer);
			$interval.cancel($scope.timerInterval);

			if (timer === 0) {
				$scope.timeLeft = '';
			}
			Socket.emit('setTimer', timer);
		};

		/*********************************** PUBLIC METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/********************************* PRIVATE METHODS - START **********************************/

		$scope.$on("$destroy", function(){
	        console.log('Leaving DashCtrl now!');
	        Socket.removeAllListeners();
	    });

	    $scope.buildScale = function () {
	    	$scope.scale = [];

	    	for (var i = 0; i <= 60; i+=5) {
	    		$scope.scale.push(i);
	    	}
	    };

	    $scope.mouseoverWideDiv = function() {
	    	console.log('Disabling now swipe');
		    $ionicSlideBoxDelegate.enableSlide(false);
		};

		$scope.mouseleaveWideDiv = function() {
			console.log('Enabling now swipe');
		    $ionicSlideBoxDelegate.enableSlide(true);
		};

		$scope.setNewTemperature = function () {
			if ($scope.slider && $scope.slider.value) {
				console.log('About to set a new temp of %s', $scope.slider.value);
				Socket.emit('setDesiredTemperature', $scope.slider.value);
			} else {
				console.log('No $scope.slider.value here!');
			}
		};

		/********************************** PRIVATE METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/************************************ RUN ONLOAD - START ************************************/	

		Socket.emit('getDesiredTemperature');
		Socket.emit('getHeatingStatus');
		Socket.emit('getTimer');

		console.log('timestamp now: %s', new Date().getTime());
		console.log(new Date());
		var y = new Date().getFullYear() + 1;
		var yDate = new Date(y, 0, 1).getTime();
		console.log('year timestamp: %s', yDate);
		console.log(new Date(y, 0, 1));

		$scope.buildScale();

		$scope.slider = {
			options: {
				floor: 		10,
				ceil: 		32,
				vertical: 	true,
				showSelectionBar: true,
				onEnd: function (id) {
					$scope.setNewTemperature(id);
				}
			}
		};

		/************************************* RUN ONLOAD - END *************************************/
		/********************************************************************************************/


	});

})();