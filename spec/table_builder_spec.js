describe('TableBuilder', function() {
  beforeEach(function() {
    this.headers = ['firstHeader', 'secondHeader'];
    this.body = [
      ['first value', 'second value'],
      ['thrid value', 'fourth value'],
    ];
  });

  describe('#initialize', function() {
    it('creates a RowBuilder by default', function() {
      this.subject = new TableBuilder(this.headers, this.body);
      expect(this.subject.rowBuilder instanceof RowBuilder).toEqual(true);
    });
  });

  describe('#asHtml', function() {
    beforeEach(function() {
      this.subject = new TableBuilder(this.headers, this.body);
    });

    it('returns a HTML table element', function() {
      var table = this.subject.asHtml();

      expect(typeof(table)).toEqual('object');
      expect(table.tagName).toEqual('TABLE');
    });

    it('contains an THEAD', function() {
      var table = this.subject.asHtml();

      thead = table.getElementsByTagName('thead')[0];
      expect(typeof(thead)).toEqual('object');
      expect(thead.tagName).toEqual('THEAD');
    });

    it('contains an TBODY', function() {
      var table = this.subject.asHtml();

      tbody = table.getElementsByTagName('tbody')[0];
      expect(typeof(tbody)).toEqual('object');
      expect(tbody.tagName).toEqual('TBODY');
    });

    describe('THEAD', function() {
      it('contains a TH for every column', function() {
        var table = this.subject.asHtml();

        expect(typeof(table)).toEqual('object');
        expect(table.tagName).toEqual('TABLE');
      });
    });

    describe('TBODY', function() {
      it('contains a TR for every row', function() {
        var table = this.subject.asHtml();

        expect(table.getElementsByTagName('tr').length).toEqual(3);
      });
    });
  });
});
