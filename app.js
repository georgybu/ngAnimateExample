var getItemSizeCacheValue = {};

function getItemSize(cssClass) {
  if (!getItemSizeCacheValue[cssClass]) {
    var $item = $('<div></div>')
      .addClass(cssClass.toString())
      .attr('style', 'display: none;');
    $(document.body).append($item);
    getItemSizeCacheValue[cssClass] = {
      height: $item.outerHeight(true) || 0,
      width: $item.outerWidth(true) || 0
    };
    $item.remove();
  }
  return getItemSizeCacheValue[cssClass];
}

function dataProvider() {
  var items = [];

  function getItems() {
    if (!items.length) {
      for (var i = 0; i < 100; i++) {
        items.push({
          title: faker.name.findName(),
          value: faker.company.companyName()
        });
      }
    }
    return items;
  }

  return {
    getItems: getItems
  }
}

function drResizeEvent() {
  return {
    scope: true,
    link: function link(scope, element, attrs) {
      var frameElementStyles = [
        'top: 0',
        'bottom: 0',
        'left: 0',
        'right: 0',
        'position: absolute',
        'width: 100%',
        'height: 100%',
        'z-index: -1',
        'border: none',
        'background-color: rgba(0, 0, 0, 0)'
      ].join(';');
      var frameElement = '<iframe style="' + frameElementStyles + '"></iframe>';
      element.append(frameElement);
      scope.element = element;
      var resizeHelper = $(element).find('> iframe');
      var resizeHandler = null;
      resizeHelper.get(0).contentWindow.onresize = function () {
        if (resizeHandler) {
          clearTimeout(resizeHandler);
        }
        resizeHandler = setTimeout(function () {
          var size = {width: resizeHelper.width(), height: resizeHelper.height()};
          scope.$broadcast('element::resize', size);
          scope.$digest();
        }, 20);
      };
    }
  };
}

function dataController(dataProvider) {
  this.items = dataProvider.getItems();
}

function animateCtrl($scope, dataProvider) {
  this.items = dataProvider.getItems();
  this.lines = [];

  var itemSize = getItemSize('animation-list-item');
  var colItemsCount, rowItemsCount, lastIndex = 0;

  function getRow(itemList) {
    var row = [];
    if (lastIndex > itemList.length - 1) {
      lastIndex = 0;
    }
    for (var i = 0; i < colItemsCount; i++) {
      row.push(itemList[lastIndex++]);
    }
    return row;
  }


  this.prev = function () {
    this.lines.unshift(getRow(this.items));
    this.lines.pop();
  };

  this.next = function () {
    this.lines.push(getRow(this.items));
    this.lines.shift();
  };

  (function (instance, scope) {
    scope.$on('element::resize', function (event, data) {
      if (data) {
        colItemsCount = Math.floor(data.width / itemSize.width) || 0;
        rowItemsCount = Math.floor(data.height / itemSize.height) || 0;
        instance.lines = [];
        for (var i = 0; i < rowItemsCount; i++) {
          instance.lines.push(getRow(instance.items));
        }
      }
    });
  }(this, $scope));
}

function drAnimationList($animateCss) {
  return {
    replace: true,
    scope: {items: '=drAnimationList'},
    templateUrl: 'animation-list.html',
    link: function (scope, element) {
      scope.listElemnent = element.find('.animation-list-wrapper');
      scope.lines = [];

      var itemSize = getItemSize('animation-list-item');
      var containerSize = getItemSize('animation-list-container');

      var colItemsCount, rowItemsCount, lastIndex = 0;
      var animation = { easing: 'ease-out', duration: 0.5 };

      scope.isRunning = false;

      function getRow(itemList) {
        var row = [];
        if (lastIndex > itemList.length - 1) {
          lastIndex = 0;
        }
        for (var i = 0; i < colItemsCount; i++) {
          row.push(itemList[lastIndex++]);
        }
        return row;
      }

      var animationTop = '-' + itemSize.height + 'px';

      scope.prev = function () {
        if (!scope.isRunning) {
          scope.isRunning = true;
          scope.listElemnent.get(0).style.top = animationTop;
          scope.lines.unshift(getRow(this.items));
          animation.from = {top: animationTop};
          animation.to = {top: '0px'};
          $animateCss(scope.listElemnent, animation).start().then(function () {
            scope.lines.pop();
            scope.isRunning = false;
          });
        }
      };

      scope.next = function () {
        if (!scope.isRunning) {
          scope.isRunning = true;
          scope.lines.push(getRow(this.items));
          animation.from = {top: '0px'};
          animation.to = {top: animationTop};
          $animateCss(scope.listElemnent, animation).start().then(function () {
            scope.listElemnent.get(0).style.top = '0px';
            scope.lines.shift();
            scope.isRunning = false;
          });
        }
      };

      (function (instance, scope) {
        scope.$on('element::resize', function (event, data) {
          if (data) {
            colItemsCount = Math.floor(data.width / itemSize.width) || 0;
            rowItemsCount = Math.floor(data.height / itemSize.height) || 0;
            instance.lines = [];
            for (var i = 0; i < rowItemsCount; i++) {
              instance.lines.push(getRow(instance.items));
            }
          }
        });
      }(scope, scope));
    }
  }
}

function sampleController($q) {
  this.promiseFunction = function() {
    var deferred = $q.defer();

    setTimeout(function() {
      /*
       // deferred.notify('About to greet ' + name + '.');
       // deferred.resolve('Hello, ' + name + '!');
       deferred.reject('Greeting ' + name + ' is not allowed.');
       */
      deferred.resolve('Hello, world!');
    }, 1000);

    return deferred.promise;
  };
}

function drIntervalController($scope) {
  // isPause
  // startActionCall
  // finishActionCall
  // interval = promise + timeout

  console.log('start');
  $scope.action().then(function() {
    console.log('end');
  });

}

function drInterval() {
  return {
    scope: {
      action: '&drInterval'
    },
    controller: drIntervalController
  }
}


function drCssTransitionCallback($transition) {
  return {
    link: function link(scope, element, attrs) {
      console.log(element, 'animation start');

      $(element).one('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
        console.log(element, 'animation end');
      });
    }
  }
}

angular.element(document).ready(function () {
  var appName = 'ngApp';
  angular.module(appName, [
    'ngAnimate',
    'ui.bootstrap.transition'
  ])
    .controller('dataController', dataController)
    .controller('animateCtrl', animateCtrl)
    .controller('sampleController', sampleController)
    .directive('drAnimationList', drAnimationList)
    .directive('drResizeEvent', drResizeEvent)
    .directive('drInterval', drInterval)
    .directive('drCssTransitionCallback', drCssTransitionCallback)
    .factory('dataProvider', dataProvider);
  angular.bootstrap(document, [appName]);
});

// ----------------------------------------------------------------------------
// this is copy from angular-bootstrap

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
angular.module('ui.bootstrap.transition', []).factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}]);
