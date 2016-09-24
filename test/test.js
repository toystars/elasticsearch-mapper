'use strict';

var expect = require('chai').expect;
var mapper = require('../index');
var inspector = require('util');


describe('#getDefaultConfig', function () {
  it('should return default configuration', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    expect(mapper.getDefaultConfig()).to.deep.equal({
      "index.mapper.dynamic": false,
      "analysis": {
        "filter": {
          "edgeNGram_filter": {
            "type": "edgeNGram",
            "min_gram": 3,
            "max_gram": 15,
            "token_chars": [ "letter", "digit", "punctuation", "symbol" ]
          }
        },
        "analyzer": {
          "edgeNGram_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [ "lowercase", "asciifolding", "edgeNGram_filter" ]
          },
          "whitespace_analyzer": {
            "type": "custom",
            "tokenizer": "whitespace",
            "filter": [ "lowercase", "asciifolding" ]
          }
        }
      }
    });
  });
});


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


describe('#getMappings', function () {

  it('should return mapping objects of specified index', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    expect(mapper.getMappings('Animals')).to.deep.equal({});
  });

  it('should return mapping objects of specified index', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    var document = {
      name: 'Bingo',
      species: 'Canis lupus familiaris',
      age: 15,
      dateAcquired: new Date,
      words: ['come', 'go', 'sit', 'jump', 'fetch', 'catch']
    };
    var document2 = {
      name: 'Oscar David',
      species: 'Homo Sapiens',
      height: '189cm',
      dateOfBirth: new Date,
      languages: ['English', 'Spanish']
    };
    var config = [];
    mapper.mapFromDoc('Animals', 'dogs', document, config);
    mapper.mapFromDoc('Animals', 'humans', document2, config);
    expect(mapper.getMappings('Animals')).to.deep.equal({
      dogs: {
        _all: {
          enabled: false
        },
        dynamic: 'false',
        properties: {
          name: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          },
          species: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          },
          age: {
            type: 'double',
            index: 'no'
          },
          dateAcquired: {
            type: 'date',
            index: 'no'
          },
          words: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          }
        }
      },
      humans: {
        _all: {
          enabled: false
        },
        dynamic: 'false',
        properties: {
          name: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          },
          species: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          },
          height: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          },
          dateOfBirth: {
            type: 'date',
            index: 'no'
          },
          languages: {
            type: 'string',
            analyzer: 'edgeNGram_analyzer',
            search_analyzer: 'whitespace_analyzer'
          }
        }
      }
    });
  });
});



describe('#getSingleMapping', function () {

  it('should return single mapping of specified index', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    expect(mapper.getSingleMapping('Animals', 'dogs')).to.be.undefined;
  });

  it('should return single mapping of specified index', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.index('Animals');
    var document = {
      name: 'Bingo',
      species: 'Canis lupus familiaris',
      age: 15,
      dateAcquired: new Date,
      words: ['come', 'go', 'sit', 'jump', 'fetch', 'catch']
    };
    var config = [];
    mapper.mapFromDoc('Animals', 'dogs', document, config);
    expect(mapper.getSingleMapping('Animals', 'dogs')).to.deep.equal({
      _all: {
        enabled: false
      },
      dynamic: 'false',
      properties: {
        name: {
          type: 'string',
          analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        species: {
          type: 'string',
          analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        age: {
          type: 'double',
          index: 'no'
        },
        dateAcquired: {
          type: 'date',
          index: 'no'
        },
        words: {
          type: 'string',
          analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        }
      }
    });
  });
});



describe('#disableIndexLevelDynamicMappings and #enableIndexLevelDynamicMappings', function () {
  it('should remove index.mapper.dynamic field from index settings which disables index level dynamic mappings settings completely', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    var index = 'Animals';
    mapper.index(index);
    mapper.disableIndexLevelDynamicMappings(index);
    expect(mapper.getIndex(index).settings.hasOwnProperty('index.mapper.dynamic')).to.be.false;
  });

  it('should add index.mapper.dynamic field to index settings which enables index level dynamic mappings settings', function () {
    var index = 'Animals';
    mapper.enableIndexLevelDynamicMappings(index);
    expect(mapper.getIndex(index).settings.hasOwnProperty('index.mapper.dynamic')).to.be.true;
  });

});


describe('#dynamicMapping', function () {
  it('should enable or disable dynamic mappings in specified index', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    var index = 'Animals';
    mapper.index(index);
    mapper.dynamicMapping(index, true);
    expect(mapper.getIndex(index).settings['index.mapper.dynamic']).to.be.true;
  });
});



describe('#typeDynamicMapping', function () {
  it('should return false as default type dynamic mapping settings', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    var index = 'Animals';
    var type = 'dogs';
    mapper.index(index);
    var document = {
      name: 'Bingo',
      breed: 'German Shepard',
      age: 15,
      dateAcquired: new Date
    };
    mapper.mapFromDoc('Animals', type, document, []);
    expect(mapper.getIndex(index).mappings[type].dynamic).to.equal('false');
  });

  it('should toggle dynamic mapping for specified index type', function () {
    var index = 'Animals';
    var type = 'dogs';
    // disable index level dynamic mapping to avoid error
    mapper.disableIndexLevelDynamicMappings(index);
    mapper.typeDynamicMapping(index, type, true);
    expect(mapper.getIndex(index).mappings[type].dynamic).to.equal('true');
  });
});



describe('#configure', function () {
  it('should add filter to the list of defaultConfig filters', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.configure({
      filters: {
        nGram_filter: {
          type: 'edgeNGram',
          min_gram: 3,
          max_gram: 15,
          token_chars: [ 'letter', 'digit', 'punctuation', 'symbol' ]
        }
      }
    });
    expect(mapper.getDefaultConfig().analysis.filter['nGram_filter']).to.deep.equal({
      type: 'edgeNGram',
      min_gram: 3,
      max_gram: 15,
      token_chars: [ 'letter', 'digit', 'punctuation', 'symbol' ]
    });
  });

  it('should add analyzer to the list of defaultConfig analyzers', function () {
    // clear mapper to remove left-over config
    // mapper.clear();
    mapper.configure({
      analyzers: {
        sample_analyzer: {
          type: 'custom',
          tokenizer: 'whitespace',
          filter: [ 'lowercase', 'asciifolding' ]
        }
      }
    });
    expect(mapper.getDefaultConfig().analysis.analyzer['sample_analyzer']).to.deep.equal({
      type: 'custom',
      tokenizer: 'whitespace',
      filter: [ 'lowercase', 'asciifolding' ]
    });
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
          analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        breed: {
          type: 'string',
          analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        age: {type: 'double', index: 'no'},
        dateAcquired: {type: 'date', index: 'no'},
        words: {
          type: 'string',
          analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        profile: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              analyzer: 'edgeNGram_analyzer',
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
              analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            age: {type: 'double', index: 'no'},
            profile: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  analyzer: 'edgeNGram_analyzer',
                  search_analyzer: 'whitespace_analyzer'
                },
                gender: {
                  type: 'string',
                  analyzer: 'edgeNGram_analyzer',
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



describe('#mapFromDoc - user defined config', function () {

  it('should return generated type mapping from user defined config', function () {
    // clear mapper to remove left-over config
    mapper.clear();
    mapper.configure({
      filters: {
        nGram_filter: {
          type: 'edgeNGram',
          min_gram: 3,
          max_gram: 15,
          token_chars: [ 'letter', 'digit', 'punctuation', 'symbol' ]
        }
      },
      analyzers: {
        nGram_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [ 'lowercase', 'asciifolding', 'nGram_filter' ]
        }
      }
    });
    mapper.index('Animals');
    var document = {
      name: 'Bingo',
      breed: 'German Shepard',
      spec: 'Security',
      age: 15,
      dateAcquired: new Date,
      words: ['come', 'go', 'sit', 'jump', 'fetch', 'catch'],
      profile: {
        origin: 'Germany',
        colour: 'Orange',
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
    var config = [{
      field: 'previousOwners.profile.gender',
      tokenize: false
    }, {
      field: 'name',
      tokenize: false
    }, {
      field: 'profile.origin',
      tokenize: true
    }, {
      field: 'profile.colour',
      tokenize: true,
      index: 'nGram_analyzer',
      search: 'whitespace_analyzer'
    }, {
      field: 'words',
      tokenize: false
    }, {
      field: 'breed',
      tokenize: true,
      index: 'nGram_analyzer',
      search: 'whitespace_analyzer'
    }];
    mapper.mapFromDoc('Animals', 'dogs', document, config);
    expect(mapper.getIndex('Animals').mappings['dogs']).to.deep.equal({
      _all: {
        enabled: false
      },
      dynamic: 'false',
      properties: {
        name: {
          type: 'string',
          index: 'not_analyzed'
        },
        breed: {
          type: 'string',
          analyzer: 'nGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        spec: {
          type: 'string',
          index: 'no'
        },
        age: {
          type: 'double',
          index: 'no'
        },
        dateAcquired: {
          type: 'date',
          index: 'no'
        },
        words: {
          type: 'string',
          index: 'not_analyzed'
        },
        profile: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            colour: {
              type: 'string',
              analyzer: 'nGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            trueBreed: {
              type: 'boolean',
              index: 'no'
            }
          }
        },
        previousOwners: {
          type: 'nested',
          properties: {
            name: {
              type: 'string',
              index: 'no'
            },
            age: {
              type: 'double',
              index: 'no'
            },
            profile: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  index: 'no'
                },
                gender: {
                  type: 'string',
                  index: 'not_analyzed'
                },
                dob: {
                  type: 'date',
                  index: 'no'
                },
                active: {
                  type: 'boolean',
                  index: 'no'
                }
              }
            },
            tags: {
              type: 'double',
              index: 'no'
            }
          }
        }
      }
    });
  });

});





