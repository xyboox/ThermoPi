(function () {
	'use strict';

	var app = angular.module('starter');

	app.controller('HistoryCtrl', function ($rootScope, $scope, $state, $http, $timeout, Socket, Config){
		console.info('HistoryCtrl --> LOADED');
				

		/********************************************************************************************/
		/********************************* SOCKET LISTENERS - START *********************************/

		Socket.on('data', function (data) {
            console.info('Socket (data) <-- RECEIVED: %O', data);

            $scope.temperatures = data.temperatures;
            $scope.runnings = data.runnings;

            $scope.loading = false;

            $timeout(function () {
            	$scope.canvasH = document.getElementsByTagName('canvas')[0].offsetHeight;
            }, 500);
        });

		/********************************** SOCKET LISTENERS - END **********************************/
		/********************************************************************************************/

		/********************************************************************************************/
		/********************************** PUBLIC METHODS - START **********************************/

		

		/*********************************** PUBLIC METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/********************************* PRIVATE METHODS - START **********************************/

		$scope.$on("$destroy", function(){
	        console.log('Leaving HistoryCtrl now!');
	        Socket.removeAllListeners();
	    });

		$scope.defineAzi = function () {
			var d = new Date();
			$scope.azi = d.getDate() + ' ' + $scope.getNiceMonth(d.getMonth()) + ', ' + d.getFullYear(); 
		};

		$scope.getNiceMonth = function (month) {
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
	   	};

	   	$scope.getData = function (cD) {
	   		$scope.loading = true;
	   		var d = $scope.chartDayAsJSON(cD);

	   		$scope.azi = d.day + ' ' + $scope.getNiceMonth(d.month) + ', ' + d.year;

	   		Socket.emit('getData', d);
	   	};

	   	$scope.setLoadingHeight = function () {
	   		var style = {
	   			'min-height': $scope.canvasH + 'px'
	   		};

	   		return style;
	   	};

	   	$scope.backwardsDay = function () {
	   		var d = new Date($scope.chartDay);
	   		d.setDate(d.getDate() - 1);
	   		$scope.chartDay = d;

	   		$timeout(function () {
	   			$scope.$apply();
	   		});

	   		$scope.getData($scope.chartDay);
	   	};

	   	$scope.forwardDay = function () {
	   		var d = new Date($scope.chartDay);
	   		d.setDate(d.getDate() + 1);
	   		$scope.chartDay = d;

	   		$timeout(function () {
	   			$scope.$apply();
	   		});

	   		$scope.getData($scope.chartDay);
	   	};

		/********************************** PRIVATE METHODS - END ***********************************/
		/********************************************************************************************/





		/********************************************************************************************/
		/************************************ RUN ONLOAD - START ************************************/

		$scope.labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		$scope.series = ['Series A'];

		$scope.onClick = function (points, evt) {
			console.log(points, evt);
		};

		$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
		
		$scope.options = {
			scales: {
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left'
					}
				]
			}
		};

		$scope.temperaturesColors = [];
		for (var i = 0; i < 24; i++) {
			$scope.temperaturesColors.push('#EEEEEE');
		}

		$scope.runningsColors = [];
		for (var i = 0; i < 24; i++) {
			$scope.runningsColors.push('#EEEEEE');
		}

		var d = new Date();
		$scope.chartDay = d;

		$scope.chartDayAsJSON = function (date) {
			var d = {
				year: date.getFullYear(),
				month: date.getMonth(),
				day: date.getDate()
			};

			return d;
		};

		$scope.getData($scope.chartDay);

		$scope.defineAzi();


		/************************************* RUN ONLOAD - END *************************************/
		/********************************************************************************************/


	});

})();