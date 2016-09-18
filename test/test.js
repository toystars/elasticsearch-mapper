'use strict';

var expect = require('chai').expect;
var mapper = require('../index');


describe('#clear', function () {
  it('should return 0 after clearing Mapper', function () {
    mapper.index('Animals');
    mapper.index('Plants');
    expect(mapper.indexCount()).to.equal(2);
    // clear mapper to remove left-over config
    mapper.clear();
    expect(mapper.indexCount()).to.equal(0);
  });
});


describe('#index', function () {
  it('should return length of indices registered', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    expect(mapper.indexCount()).to.equal(1);
  });
});


describe('#getIndex', function () {

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


describe('#mapFromDoc', function () {

  it('should return generated type mapping', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    var document = {
      name: 'Bingo',
      breed: 'German Shepard',
      age: 15,
      dateAcquired: new Date,
      words: ['come', 'go', 'sit', 'jump', 'fetch', 'catch'],
      profile: {
        origin: 'Germany',
        trueBreed: false
      },
      previousOwners: [{
        name: 'Tunde',
        age: 20,
        profile: {
          status: 'married',
          gender: 'male',
          dob: new Date,
          active: true
        },
        tags: [1, 2, 3, 4]
      }]
    };
    var config = [];
    expect(mapper.mapFromDoc('Animals', 'dogs', document, config)).to.deep.equal({
      _all: {
        enabled: false
      },
      dynamic: 'false',
      properties: {
        name: {
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        breed: {
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        age: {type: 'double', index: 'no'},
        dateAcquired: {type: 'date', index: 'no'},
        words: {
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        profile: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              index_analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            trueBreed: {type: 'boolean', index: 'no'}
          }
        },
        previousOwners: {
          type: 'nested',
          properties: {
            name: {
              type: 'string',
              index_analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            age: {type: 'double', index: 'no'},
            profile: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  index_analyzer: 'edgeNGram_analyzer',
                  search_analyzer: 'whitespace_analyzer'
                },
                gender: {
                  type: 'string',
                  index_analyzer: 'edgeNGram_analyzer',
                  search_analyzer: 'whitespace_analyzer'
                },
                dob: {type: 'date', index: 'no'},
                active: {type: 'boolean', index: 'no'}
              }
            },
            tags: {type: 'double', index: 'no'}
          }
        }
      }
    });
  });

});

