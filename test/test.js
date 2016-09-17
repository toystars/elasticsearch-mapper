'use strict';

var expect = require('chai').expect;
var mapper = require('../index');


describe('#AddIndex', function() {
  it('should return length of indices registered', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    expect(mapper.indexCount()).to.equal(1);
  });
});
