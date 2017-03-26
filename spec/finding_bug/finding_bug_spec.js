describe('FindingBug', function() {
  describe('#newTest', function() {
    beforeEach(function() {
      var stubbedContainer = {
        appendChild: function(element) { },
      };
      spyOn(document, 'getElementById').and.returnValue(stubbedContainer);

      var stubbedCanvas = {
        on: function(event, eventHandler) { },
        add: function(object) { },
        setBackgroundImage: function(image, callback) {},
        renderAll: {
          bind: function(canvas) {}
        }
      };
      spyOn(fabric, 'Canvas').and.returnValue(stubbedCanvas);

      this.spy = {
        fromURL: function(url, moveObject) { },
      };
      fabric.Image = this.spy;
      spyOn(this.spy, 'fromURL');
    });

    it('initializes the canvas with the given quantity of bugs', function() {
      subject = new FindingBug({quantity: 5});

      subject.newTest();

      expect(this.spy.fromURL.calls.count()).toEqual(5);
    });
  });
});

