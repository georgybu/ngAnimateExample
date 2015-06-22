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

function appController($scope, dataProvider) {
  this.items = dataProvider.getItems();
  this.lines = [];

  var itemSize = getItemSize('animation-list-item');
  var containerSize = getItemSize('animation-list-container');

  var colItemsCount = Math.floor(containerSize.width / itemSize.width) || 0;
  var rowItemsCount = Math.floor(containerSize.height / itemSize.height) || 0;

  var lastIndex = 0;

  function getRow(itemList) {
    var row = [];
    if (lastIndex > itemList.length - 1) { lastIndex = 0; }
    for (var i = 0; i < colItemsCount; i++) {
      row.push(itemList[lastIndex++]);
    }
    return row;
  }

  for (var i = 0; i < rowItemsCount; i++) {
    this.lines.push(getRow(this.items));
  }

  this.prev = function() {
    this.lines.unshift(getRow(this.items));
    this.lines.pop();
  };

  this.next = function() {
    this.lines.push(getRow(this.items));
    this.lines.shift();
  };
}

angular.element(document).ready(function () {
  var appName = 'ngApp';
  angular.module(appName, ['ngAnimate'])
    .controller('appCtrl', appController)
    .factory('dataProvider', dataProvider);
  angular.bootstrap(document, [appName]);
});
