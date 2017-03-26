describe('RowBuilder', function() {
  beforeEach(function() {
    this.headers = ['firstHeader', 'secondHeader'];
    this.row = ['first value', 'second value'];
  });

  describe('#initialize', function() {
    it('creates SimpleCellTextBuilders by default', function() {
      this.subject = new RowBuilder(this.headers);
      this.subject.cellBuilders.forEach(function(rowBuilder) {
        expect(rowBuilder instanceof SimpleTextCellBuilder).toEqual(true);
      });
    });

    it('creates a SimpleCellTextBuilder for each column', function() {
      this.subject = new RowBuilder(this.headers);
      expect(this.subject.cellBuilders.length).toEqual(2);

      var fourColumnHeaders = ['firstHeader', 'secondHeader','thridHeader', 'fourthHeader'];
      this.subject = new RowBuilder(fourColumnHeaders);
      expect(this.subject.cellBuilders.length).toEqual(4);
    });
  });

  describe('#build', function() {
    beforeEach(function() {
      this.subject = new RowBuilder(this.headers);
    });

    it('returns a TR element', function() {
      var tr = this.subject.build(this.row);

      expect(typeof(tr)).toEqual('object');
      expect(tr.tagName).toEqual('TR');
    });

    it('calls the cellBuilders for each cell in the row', function() {
      spyOn(this.subject.cellBuilders[0], 'buildCell').and.callThrough();
      spyOn(this.subject.cellBuilders[1], 'buildCell').and.callThrough();

      this.subject.build(this.row);

      expect(this.subject.cellBuilders[0].buildCell).toHaveBeenCalledWith(this.row[0]);
      expect(this.subject.cellBuilders[1].buildCell).toHaveBeenCalledWith(this.row[1]);
    });

    it('adds each cell into the the row', function() {
      var tr = this.subject.build(this.row);

      expect(tr.children[0].textContent).toBe('first value');
      expect(tr.children[1].textContent).toBe('second value');
    });

    describe('when it is called with header params', function() {
      it('calls the cellBuilders for each cell in the header', function() {
        spyOn(this.subject.cellBuilders[0], 'buildHeader').and.callThrough();
        spyOn(this.subject.cellBuilders[1], 'buildHeader').and.callThrough();

        this.subject.build(this.row, true);

        expect(this.subject.cellBuilders[0].buildHeader).toHaveBeenCalledWith(this.row[0]);
        expect(this.subject.cellBuilders[1].buildHeader).toHaveBeenCalledWith(this.row[1]);
      });
    });

  });
});
