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


describe('#getIndex', function() {

  it('should return the index object containing analyzers (index and search) and types mappings', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    expect(mapper.getIndex('Animals')).to.deep.equal({
      settings: {
        'index.mapper.dynamic': false,
        analysis: {
          filter: {
            edgeNGram_filter: {
              type: 'edgeNGram',
              min_gram: 3,
              max_gram: 15,
              token_chars: ['letter', 'digit', 'punctuation', 'symbol']
            }
          },
          analyzer: {
            edgeNGram_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'edgeNGram_filter']
            },
            whitespace_analyzer: {
              type: 'custom',
              tokenizer: 'whitespace',
              filter: ['lowercase', 'asciifolding']
            }
          }
        }
      },
      mappings: {}
    });
  });

  it('should return undefined if index is not registered', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    expect(mapper.getIndex('Persons')).to.be.undefined;
  });
});
