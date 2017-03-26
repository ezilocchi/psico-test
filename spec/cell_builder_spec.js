describe('SimpleTextCellBuilder', function() {
  beforeEach(function() {
    this.cellText = 'Some Random Text';
    this.builder = new SimpleTextCellBuilder();
    this.subject = this.builder.buildCell(this.cellText);
  });

  describe('#buildCell', function() {
    beforeEach(function() {
      this.subject = this.builder.buildCell(this.cellText);
    });

    it('returns a TD element', function() {
      expect(typeof(this.subject)).toEqual('object');
      expect(this.subject.tagName).toEqual('TD');
    });

    it('returns a TEXT NODE inside the TD', function() {
      expect(this.subject.firstChild.nodeValue).toEqual(this.cellText);
    });
  });

  describe('#buildHeader', function() {
    beforeEach(function() {
      this.subject = this.builder.buildHeader(this.cellText);
    });

    it('returns a TH element', function() {
      expect(typeof(this.subject)).toEqual('object');
      expect(this.subject.tagName).toEqual('TH');
    });

    it('returns a TEXT NODE inside the TH', function() {
      expect(this.subject.firstChild.nodeValue).toEqual(this.cellText);
    });
  });
});

