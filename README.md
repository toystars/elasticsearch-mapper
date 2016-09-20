# elasticsearch-mapper
[![Build Status](https://travis-ci.org/toystars/elasticsearch-mapper.svg?branch=master)](https://travis-ci.org/toystars/elasticsearch-mapper) [![Coverage Status](https://coveralls.io/repos/github/toystars/elasticsearch-mapper/badge.svg?branch=master)](https://coveralls.io/github/toystars/elasticsearch-mapper?branch=master) [![npm](https://img.shields.io/npm/dt/elasticsearch-mapper.svg?maxAge=2592000)](https://www.npmjs.com/package/elasticsearch-mapper) [![npm](https://img.shields.io/npm/v/elasticsearch-mapper.svg?maxAge=2592000)](https://www.npmjs.com/package/elasticsearch-mapper)
> Automatic mappings generator for ElasticSearch and MongoDB collections...


> Getting started with ElasticSearch is easy enough, and the powerful full-text search engine can do lots of stuff out of the box and this include dynamic mappings. Yes, you don't have to tell ElasticSearch what kind of data you want to index and it will handle it appropriately, well most of the time. But there are some occasions when you need to tell ElasticSearch the kind of data to expect so it can perform better (index and search) and not rely on too many generic fallbacks. That is where `elasticsearch-mapper` comes in.

> [Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) in ElasticSearch is somewhat complex and the aim of this package to make it simple by exposing APIs that can generate default mappings for you that work most of the time. It comes bundled with default configurations that will get you started in no time, no matter the kind of data you have (deeply nested JSON document search also supported).

## Installation

``` bash
$ npm install elasticsearch-mapper --save
```

## Usage

The package assumes that you have a running ElasticSearch cluster, so it does not deal with connecting to ElasticSearch and how to send data to ElasticSearch (although, the output of this package will be used for index creation). All these can be done using the official JavaScript [ElasticSearch module](https://www.npmjs.com/package/elasticsearch). It also assumes that you have a basic understanding of the relationship between [mappings](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html), [index](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html) and types as related to ElasticSearch.

### Super simple set-up

Say you have two mongoDB collections (books and foods) which you wish to enable full-text search on using ElasticSearch. And say you decide to have the two collections under one ElasticSearch index called `Needs` and the JSON documents below are sample from the collections.

```javascript
var sampleBook = {
    name: 'ElasticSearch for beginners',
    author: {
        name: 'Mustapha Babatunde',
        profession: 'Software Engineer',
        hobbies: 'Gaming',
        dob: new Date
    },
    ISBN: '192818182BHD1882',
    pages: 560,
    category: 'Search and Analytics'
};

var sampleFood = {
    name: 'Amala and Ewedu',
    origin: 'Nigeria, West Africa',
    class: 'swallow',
    colour: 'Dark Brown',
    supportFood: ['Ogunfe', 'Gbegiri', 'Efo-riro', 'Egusi']
};
```

With the sample data above, creating the `Needs` index and required types is insanely easy. The snippet below does just that:

```javasript
var mapper = require('elasticsearch-mapper');

// register the Needs index
mapper.index('Needs');
// register books and foods types under Needs index. This creates mappings for the respective types
mapper.mapFromDoc('Needs', 'books', sampleBook); // if the specified index has not been registered beforehand, this will create the index on the fly and register the required mapping
mapper.mapFromDoc('Needs', 'foods', sampleFood);

```

That's it! You how have a well defined index and types. This quick index and mappings creation process makes use of some default settings which works most of the time. To have a look of what was created in the index and mappings, you can fetch the index like below:

```javascript
var index = mapper.getIndex('Needs');
```

The query above will return the object similar to what is below:

```javascript

{  
  settings:{  
    'index.mapper.dynamic':false,
    analysis:{  
      filter:{  
        edgeNGram_filter:{  
          type:'edgeNGram',
          min_gram:3,
          max_gram:15,
          token_chars:[  
            'letter',
            'digit',
            'punctuation',
            'symbol'
          ]
        }
      },
      analyzer:{  
        edgeNGram_analyzer:{  
          type:'custom',
          tokenizer:'standard',
          filter:['lowercase', 'asciifolding', 'edgeNGram_filter']
        },
        whitespace_analyzer:{  
          type:'custom',
          tokenizer:'whitespace',
          filter:['lowercase', 'asciifolding']
        }
      }
    }
  },
  mappings:{  
    books:{  
      _all:{  
        enabled:false
      },
      dynamic:'false',
      properties:{  
        name:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        },
        author:{  
          type:'object',
          properties:{  
            name:{  
              type:'string',
              index_analyzer:'edgeNGram_analyzer',
              search_analyzer:'whitespace_analyzer'
            },
            profession:{  
              type:'string',
              index_analyzer:'edgeNGram_analyzer',
              search_analyzer:'whitespace_analyzer'
            },
            hobbies:{  
              type:'string',
              index_analyzer:'edgeNGram_analyzer',
              search_analyzer:'whitespace_analyzer'
            },
            dob:{  
              type:'date',
              index:'no'
            }
          }
        },
        ISBN:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        },
        pages:{  
          type:'double',
          index:'no'
        },
        category:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        }
      }
    },
    foods:{  
      _all:{  
        enabled:false
      },
      dynamic:'false',
      properties:{  
        name:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        },
        origin:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        },
        class:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        },
        colour:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        },
        supportFood:{  
          type:'string',
          index_analyzer:'edgeNGram_analyzer',
          search_analyzer:'whitespace_analyzer'
        }
      }
    }
  }
}

```

The index object above shows the basic configurations that are applied to the index and mappings. By this, only string fields are marked as indexed and searchable by default and an `edgeNGram` index analyzer is applied to all string fields with `min_gram` of 3 and `max_gram` of 15. This means, all string fields will be tokenized with the smallest token being 3 characters and maximum token as 15 characters. All this can be changed per index and custom analyzers can be added to each index. Click [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-analyzers.html) to know more about ElasticSearch analyzers.

Going forward with the `super simple set-up`, you can send the created index to ElasticSearch using any package providing that capability. The snippet below shows how to send it using the official npm module after successful connection to the cluster.

```javascript
EsClient.indices.create({  
    'index':'Needs',
    'body':mapper.getIndex('Needs'),
    'update_all_types':true
  }, function (error, response, responseCode) {  
        // some other code here...
  }
});
```

Expecting more steps? Sorry to disappoint you. That is all you need to get a working and valid ElasticSearch index from sample data.


### Not so super simple set-up



## Contributing

Contributions are **welcome** and will be fully **credited**. Check [CONTRIBUTORS](CONTRIBUTORS.md) for more information.

Contributions are accepted via Pull Requests on [Github](https://github.com/toystars/elasticsearch-mapper).


### Pull Requests

- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.

- **Consider our release cycle** - We try to follow [SemVer v2.0.0](http://semver.org/). Randomly breaking public APIs is not an option.

- **Create feature branches** - Don't ask us to pull from your master branch.

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.

- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](http://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.


## Issues

Check issues for current issues.

## Author

[![Mustapha Babatunde](https://cloud.githubusercontent.com/assets/16062709/18664912/957ca39e-7f1c-11e6-9948-ce84832c8218.jpg)](https://twitter.com/iAmToystars)
 

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.

