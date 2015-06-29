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

  var transitionState = null;
  this.transitionCallback = function (transition) {
    if (transitionState != transition.state) {
      transitionState = transition.state;
      var isRun = transitionState === "start";
      console.log($scope.$id, +new Date(), 'Animation with transition', isRun);
    }
  }
}

function drAnimationList($animateCss) {
  return {
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

      function logState() {
        console.log(scope.$id, +new Date(), 'Animation with $animateCss', scope.isRunning);
      }

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
          logState();
          scope.listElemnent.get(0).style.top = animationTop;
          scope.lines.unshift(getRow(this.items));
          animation.from = {top: animationTop};
          animation.to = {top: '0px'};
          $animateCss(scope.listElemnent, animation).start().then(function () {
            scope.lines.pop();
            scope.isRunning = false;
            logState();
          });
        }
      };

      scope.next = function () {
        if (!scope.isRunning) {
          scope.isRunning = true;
          logState();
          scope.lines.push(getRow(this.items));
          animation.from = {top: '0px'};
          animation.to = {top: animationTop};
          $animateCss(scope.listElemnent, animation).start().then(function () {
            scope.listElemnent.get(0).style.top = '0px';
            scope.lines.shift();
            scope.isRunning = false;
            logState();
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

function drIntervalController($scope, $timeout) {
  function loop() {
    $scope.action().then(function() {
      $timeout(function() { loop() }, 1500);
    });
    loop();
  }
}

function drInterval() {
  return {
    scope: { action: '&drInterval' },
    controller: drIntervalController
  }
}


function drCssTransitionCallback() {
  return {
    scope: { action: '&drCssTransitionCallback' },
    link: function link(scope, element, attrs) {
      var eventList = [
        'transitionend',
        'webkitTransitionEnd',
        'oTransitionEnd',
        'otransitionend'
      ].join(' ');
      var callback = scope.action();
      callback({ state: 'start' });
      $(element).one(eventList, function() {
        callback({ state: 'finish' });
      });
    }
  }
}

angular.element(document).ready(function () {
  var appName = 'ngApp';
  angular.module(appName, [ 'ngAnimate' ])
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
