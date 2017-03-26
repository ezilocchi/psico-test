SimpleTextCellBuilder = function() {

  this.buildCell = function(text) {
    var td = document.createElement('td');
    return build(text, td);
  };

  this.buildHeader = function(text) {
    var th = document.createElement('th');
    return build(text, th);
  };

  var build = function(text, element) {
    var textNode = document.createTextNode(text);
    element.appendChild(textNode);
    return element;
  };
};
