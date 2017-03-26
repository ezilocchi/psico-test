RowBuilder = function(headers) {
  var that = this;
  this.cellBuilders = [];

  headers.forEach(function(header) {
    that.cellBuilders.push(new SimpleTextCellBuilder());
  });

  this.build = function(row, header) {
    var tr = document.createElement('tr');
    row.forEach(function(value, index) {
      var cell;
      if(header) {
        cell = that.cellBuilders[index].buildHeader(value);
      } else {
        cell = that.cellBuilders[index].buildCell(value);
      }
      tr.appendChild(cell);
    });
    return tr;
  };
};
