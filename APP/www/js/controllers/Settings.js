(function () {
	'use strict';

	var app = angular.module('starter');

	app.controller('SettingsCtrl', function ($rootScope, $scope, $state, $http, $timeout, Socket, Config){
		console.info('SettingsCtrl --> LOADED');
				

		/********************************************************************************************/
		/********************************** PUBLIC METHODS - START **********************************/

		Socket.on('ping', function (data) {
            console.info('Socket (ping) <-- RECEIVED');

            $scope.pingEnd = new Date().getTime();
            $scope.ping = $scope.pingEnd - $scope.pingStart;

            $timeout(function () {
            	$scope.pingStart = new Date().getTime();
            	Socket.emit('ping');
            }, 1000);
        });

		/*********************************** PUBLIC METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/********************************* PRIVATE METHODS - START **********************************/

		$scope.$on("$destroy", function(){
	        console.log('Leaving SettingsCtrl now!');
	        Socket.removeAllListeners();
	    });

		/********************************** PRIVATE METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/************************************ RUN ONLOAD - START ************************************/

		Socket.emit('ping');

		/************************************* RUN ONLOAD - END *************************************/
		/********************************************************************************************/


	});

})();