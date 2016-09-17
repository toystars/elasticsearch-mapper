'use strict';

var expect = require('chai').expect;
var mapper = require('../index');


describe('#clear', function() {
  it('should return 0 after clearing Mapper', function () {
    mapper.index('Animals');
    mapper.index('Plants');
    expect(mapper.indexCount()).to.equal(2);
    // clear mapper to remove left-over config
    mapper.clear();
    expect(mapper.indexCount()).to.equal(0);
  });
});

describe('#index', function() {
  it('should return length of indices registered', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    expect(mapper.indexCount()).to.equal(1);
  });
});
