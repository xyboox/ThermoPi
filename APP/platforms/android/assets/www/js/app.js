(function () {
	'use strict';

	var app = angular.module('starter', 
		[
			'ionic', 
			'btford.socket-io',
			'ngCordova',
			'chart.js',
			'rzModule'
		]
	);

	app.run(function($ionicPlatform, $timeout, $rootScope, $cordovaDevice) {
		$ionicPlatform.ready(function() {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				if (ionic.Platform.isAndroid()) {
					StatusBar.backgroundColorByHexString("#aa4636");
				} else {
					StatusBar.styleLightContent();
				}
			}

			if (window.cordova) {
				$rootScope.UUID = $cordovaDevice.getUUID();
			} else {
				$rootScope.UUID = 'browser';
			}

			if (window.cordova) {
				var push = PushNotification.init({
				    android: {
				        senderID: '469367009546',
				        icon: 'ic_stat_icon'
				    },
				    ios: {
				        alert: "true",
				        badge: true,
				        sound: 'false'
				    }
				});

				push.on('registration', function(data) {
				    console.log('Push register: %O', data.registrationId);
				    $rootScope.$emit('pushRegistered', data.registrationId);
				});

				push.on('notification', function(data) {
					console.log('PUSH NOTIICATION RECEIVED:');
				    console.log('%O', data);
				});
				push.on('error', function(e) {
				    console.log('PUSH ERROR: ', e.message);
				});
			}


			$timeout(function () {
				if (window.cordova) {
        			navigator.splashscreen.hide();
        		}
			}, 2000);
		});
	});

	app.config(function($stateProvider, $urlRouterProvider, ChartJsProvider) {

		ChartJsProvider.setOptions(
			"global",
			{
	      		colors: ['#FF5252', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF', '#E595FF'],
	    	}
	    );

		$stateProvider
			.state('tab', {
				url: '/tab',
				abstract: true,
				cache: false,
				templateUrl: 'templates/tabs.html'
			})

			.state('tab.dash', {
				url: '/dash',
				cache: false,
				views: {
					'tab-dash': {
						templateUrl: 'templates/tab-dash.html',
						controller: 'DashCtrl'
					}
				}
			})

			.state('tab.history', {
				url: '/history',
				cache: false,
				views: {
					'tab-history': {
						templateUrl: 'templates/tab-history.html',
						controller: 'HistoryCtrl'
					}
				}
			})

			.state('tab.settings', {
				url: '/settings',
				cache: false,
				views: {
					'tab-settings': {
						templateUrl: 'templates/tab-settings.html',
						controller: 'SettingsCtrl'
					}
				}
			});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/tab/dash');

	});
})();