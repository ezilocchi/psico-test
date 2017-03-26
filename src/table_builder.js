TableBuilder = function(headers, body, htmlTable) {
  var that = this;
  this.rowBuilder = new RowBuilder(headers);

  this.asHtml = function() {
    var table = htmlTable || document.createElement('table');

    var thead = document.createElement('thead');
    var header = that.rowBuilder.build(headers, true);
    table.appendChild(thead);
    thead.appendChild(header);

    var tbody = document.createElement('tbody');
    body.forEach(function(row) {
      var tr = that.rowBuilder.build(row);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  };

  this.asCSV = function(subject, prefix) {
    console.log(body);
    var file = new Blob(body, {type: 'text/csv'});
    var a = window.document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + window.encodeURIComponent(body.join('\n')));

    var filename = prefix || '';
    if(subject) {
      filename += '_';
      filename += subject;
      filename += '.csv';
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
};

