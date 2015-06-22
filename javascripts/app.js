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
      console.log(event, data);
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

      console.log(
        '$scope.$id', scope.$id, '; ',
        'itemSize', JSON.stringify(itemSize), '; ',
        'containerSize', JSON.stringify(containerSize),
        'colItemsCount', JSON.stringify(colItemsCount), '; ',
        'rowItemsCount', JSON.stringify(rowItemsCount), '; '
      );

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

angular.element(document).ready(function () {
  var appName = 'ngApp';
  angular.module(appName, ['ngAnimate'])
    .controller('dataController', dataController)
    .controller('animateCtrl', animateCtrl)
    .directive('drAnimationList', drAnimationList)
    .directive('drResizeEvent', drResizeEvent)
    .factory('dataProvider', dataProvider);
  angular.bootstrap(document, [appName]);
});
