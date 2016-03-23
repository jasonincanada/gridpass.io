var images = [
	{ src: 'market.jpg', name: 'market', width: 1472, height: 813, description: 'Food Market' },
	{ src: 'machine.jpg', name: 'machine', width: 1294, height: 741, description: 'Big Machines' },
	{ src: 'city.jpg', name: 'city', width: 1368, height: 876, description: 'City' },
	{ src: 'library.jpg', name: 'library', width: 1275, height: 820, description: 'Library' },
	{ src: 'skyscraper.jpg', name: 'skyscraper', width: 1266, height: 739, description: 'Skyscraper' },
	{ src: 'books.jpg', name: 'books', width: 1222, height: 782, description: 'Books' }
];

var space = [
	{ src: 'moon.jpg', name: 'moon', width: 1381, height: 922, description: 'Moon' },
	{ src: 'mars.jpg', name: 'mars', width: 1371, height: 748, description: 'Mars' },
];

var systems = ['blogger', 'protonmail', 'digg', 'drupal', 'facebook', 'feedly', 'foursquare', 'gmail', 'google', 'instagram', 'lastfm', 'paypal', 'reddit', 'skype', 'slashdot', 'stumbleupon', 'technorati', 'tumblr', 'twitter', 'youtube', 'yahoo'];

(function () {
    'use strict';

    var app = angular.module('gridpassApp', []);

	app.service('crypto', function() {
		var crypto = this;

		crypto.getPassword = function(plaintext, seed) {
			Math.seedrandom(seed + ' ' + plaintext);

			return generatePassword();
		};

		// From: http://stackoverflow.com/questions/1497481/javascript-password-generator
		function generatePassword() {
			var length = 16,
				charset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789()-_#$%',
				retVal = '';

			for (var i = 0, n = charset.length; i < length; ++i) {
				retVal += charset.charAt(Math.floor(Math.random() * n));
			}

			return retVal;
		};

		return crypto;
	});

	app.directive('passwordView', function() {
		return {
            templateUrl: 'app/templates/password-view.html',
            restrict: 'E',
            scope: {
				seed: '='
            },
			controller: function($scope, $timeout, crypto) {

				$scope.systems = [];
				$scope.system = { name: '', salt: 1 }; 
				$scope.custom = { name: '' }; 

				angular.forEach(systems, function(system) {
					$scope.systems.push({
						name: system,
						icon: system + '.png'
					});
				});

				$scope.mouseover = function(system) {
					$scope.system.name = system.name;

					compute();
				};

				function compute() {
					$scope.system.password = crypto.getPassword($scope.system.name + ' ' + $scope.system.salt, $scope.seed);
					$scope.custom.password = crypto.getPassword($scope.custom.name + ' ' + $scope.system.salt, $scope.seed);
				};

				$scope.$on('seedchange', function() {
					$timeout(function() {
						compute();
					});
				});

				$scope.changeCustom = function() { $timeout(function() { compute(); }); };
				$scope.changeSalt = function() { $timeout(function() { compute(); }); };
			}
        };
	});

	app.directive('gridInput', function() {
		return {
            templateUrl: 'app/templates/grid-input.html',
            restrict: 'E',
            scope: {
				model: '=',
				align: '=',
				panel: '=',
				width: '=',
				margin: '=',
				readonly: '=',
				onChange: '&'
            },
			link: function(scope) {
				scope.inputChanged = function() {
					scope.onChange();
				};
			}
        };
	});

	app.directive('pixelLight', function() {
		return {
            templateUrl: 'app/templates/pixel-light.html',
            restrict: 'E',
            scope: {
				zIndex: '=',
				card: '='
            },
			link: function(scope) {
				scope.Math = window.Math;
			}
        };
	});

	app.directive('thumbnail', function() {
		return {
            templateUrl: 'app/templates/thumbnail.html',
            restrict: 'E',
            scope: {
				zIndex: '=',
				card: '='
            },
			controller: function($scope) {

				$scope.offset = function(n) {
					return Math.floor(n / 10) * 100;
				};

				$scope.crosshairs = function(n) {
					return Math.floor(n / 4) * 40 - $scope.offset(n);
				};

				$scope.square = function(n) {
					return (n % 10) * 10;
				};
			}
        };
	});

	app.directive('gridCard', function() {
		return {
            templateUrl: 'app/templates/grid-card.html',
            restrict: 'E',
            scope: {
				zIndex: '=',
				card: '=',
				mode: '=',
				choosing: '=',
				confirmGenerate: '&',
				keyedIn: '&'
            },
			controller: function($scope) {

				$scope.hover = {
					hovering: false,
					left: 0,
					top: 0
				};

				$scope.fence = function(n) {
					return Math.floor(n/10) * 100;
				};

				$scope.moveHover = function(x, y) {
					$scope.hover.left = Math.floor(x / 100) * 100;
					$scope.hover.top = Math.floor(y / 100) * 100;
					$scope.hover.hovering = true;
				};

				$scope.clickHover = function(x2, y2) {
					var imagex = x2 + $scope.hover.left;
					var imagey = y2 + $scope.hover.top;

					// In generate mode, user clicks the exact x/y to go to the next image
					if ($scope.mode == 'generate') {
						if ($scope.card.x == Math.floor(imagex / 10) &&
							$scope.card.y == Math.floor(imagey / 10)) {

							$scope.confirmGenerate();
						}
					}

					// In keypad mode, user sets the x/y by clicking, then go to the next image
					else if ($scope.mode == 'keypad') {

						$scope.card.x = Math.floor(imagex / 10);
						$scope.card.y = Math.floor(imagey / 10);
						$scope.card.x40 = Math.floor(imagex / 40) * 40;
						$scope.card.y40 = Math.floor(imagey / 40) * 40;
						$scope.card.fading = 0.4;
						$scope.card.generated = true;

						$scope.keyedIn();
					}
				};

				$scope.hoverOverHover = function(x2, y2) {
					var imagex = x2 + $scope.hover.left;
					var imagey = y2 + $scope.hover.top;

					$scope.hover.crossLeft = Math.floor(imagex / 40) * 40 - $scope.hover.left;
					$scope.hover.crossTop = Math.floor(imagey / 40) * 40 - $scope.hover.top;

					$scope.hover.squareLeft = Math.floor(imagex / 10) * 10 - $scope.hover.left;
					$scope.hover.squareTop = Math.floor(imagey / 10) * 10 - $scope.hover.top;

					$scope.choosing.name = $scope.card.name;
					$scope.choosing.x = Math.floor(imagex / 10);
					$scope.choosing.y = Math.floor(imagey / 10);
				};
			}
        };
	});

    app.controller('GridPassCtrl', function ($timeout, $rootScope) {
        var vm = this;

		// 'generate' - User steps through new coordinates that are generated for them for each of the six images
		// 'keypad' - Free click through the images
		vm.mode = 'generate';

		vm.cards = [];
		vm.card = {};

		// Product of all (width/10 * height/10)
		vm.entropy = 1;

		vm.imageCount = images.length;

		// The image and grid coordinates the user last moused over
		vm.choosing = {
			name: '',
			x: '',
			y: ''
		};

		// This is constructed as the user clicks
		vm.randomseed = '';

		function compute() {
			var string = '';

			vm.entropy = 1;
			for (var i = 0; i < vm.cards.length; i++) {
				var card = vm.cards[i];
				
				if (string.length > 0) {
					string += ' ';
				}

				string += card.name + ' ' + card.x + ' ' + card.y;

				vm.entropy *= Math.floor(card.width/10) * Math.floor(card.height/10); 
			}

			vm.randomseed = string;
			vm.sha256 = sha256(vm.randomseed);
			vm.bits = Math.floor(Math.log(vm.entropy) / Math.log(2) * 10) / 10;

			$rootScope.$broadcast('seedchange');
		}

		function goPasswordView()
		{
			vm.passwordView = true;
			compute();

			// Focus the custom system input
			$timeout(function() {
				$('#custom-system input[type="text"]:eq(1)').focus();
			});

			// Set the system password in the password view to read-only
			// TODO: this should go somewhere else
			$('#system-system input[type="text"]:eq(1)').attr('readonly', 'readonly');
		}

		vm.add = function() {
			vm.generate();

			// TODO: better way to do this
			vm.showScribbler = true;
			vm.showSynopsis = false;
			vm.showInstructions = true;
		}

		// User clicked on the cell we generated to confirm he knows where it is
		vm.confirmGeneratedCell = function() {

			vm.card.fading = vm.card.fading || 0;

			// Each confirmation click of a generated cell fades out the frame a bit
			if (vm.card.fading < 1) {
				vm.card.fading += .15;
			}

			if (vm.card.index + 1 < vm.cards.length) {
				vm.card = vm.cards[vm.card.index + 1];
				return;
			}

			compute();

			vm.showScribbler = false;
			vm.showSynopsis = true;
			vm.showInstructions = false;
		};

		// Called in 'keypad' mode when the user clicks on an image
		vm.keyedIn = function() {
			compute();

			if (vm.cards.length < images.length) {

				for (var i = vm.card.index+1; i < vm.cards.length; i++) {
					if (vm.cards[i].generated == false) {
						vm.card = vm.cards[i];
						return;
					}
				}

				vm.generate();
			} else {
				goPasswordView();
			}
		};

		vm.practice = function() {
			vm.card = vm.cards[0];

			vm.showScribbler = false;
			vm.showSynopsis = false;
			vm.showInstructions = false;
		};

		vm.generate = function() {
			var index = vm.cards.length;

			var card = {
				generated: false,
				x: 0,
				y: 0,
				randomness: '',
				progress: 0,
				index: index,
				width: images[index].width,
				height: images[index].height,
				name: images[index].name,
				src: images[index].src,
				description: images[index].description
			};

			card.x40 = Math.floor(card.x / 4) * 40;
			card.y40 = Math.floor(card.y / 4) * 40;

			vm.cards.push(card);
			vm.card = vm.cards[index];
		};

		var randomnessRequired = 2000;

		vm.scribble = function(x, y) {
			var card = vm.card;

			if (card.randomness != '') {
				card.randomness += ' ';
			};

			card.randomness += parseInt(x) + ' ' + parseInt(y);
			card.progress = card.randomness.length / randomnessRequired;

			if (card.progress >= 1) {
				card.progress = 1;

				Math.seedrandom(card.randomness);

				card.x = Math.floor(Math.random() * (card.width - 100) / 10);
				card.y = Math.floor(Math.random() * (card.height - 100) / 10);
				card.x40 = Math.floor(card.x / 4) * 40;
				card.y40 = Math.floor(card.y / 4) * 40;

				card.generated = true;

				vm.showScribbler = false;
				vm.showInstructions = false;
			}
		};


		vm.clickThumbnail = function(i) {
			vm.passwordView = false;

			if (vm.mode == 'generate') {
				vm.showScribbler = false;
				vm.showInstructions = false;
				vm.showSynopsis = false;
			}

			vm.card = vm.cards[i];
		};

		vm.keypad = function() {
			vm.mode = 'keypad';

			vm.showScribbler = false;
			vm.showInstructions = false;
			vm.showSynopsis = false;
			vm.passwordView = false;

			vm.cards = [];
			vm.generate();
		};

		vm.addSpace = function() {

			images.push(space[0]);
			images.push(space[1]);

			vm.mode = 'keypad';
			vm.showScribbler = false;
			vm.showInstructions = false;
			vm.showSynopsis = false;
			vm.passwordView = false;

			vm.generate();
		};

		vm.generate();
		vm.card = vm.cards[0];

		vm.showScribbler = true;
		vm.showInstructions = true;
		vm.showSynopsis = false;

        return vm;
    });

})();

