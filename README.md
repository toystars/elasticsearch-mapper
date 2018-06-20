# elasticsearch-mapper
[![Build Status](https://travis-ci.org/toystars/elasticsearch-mapper.svg?branch=master)](https://travis-ci.org/toystars/elasticsearch-mapper) [![Coverage Status](https://coveralls.io/repos/github/toystars/elasticsearch-mapper/badge.svg?branch=master)](https://coveralls.io/github/toystars/elasticsearch-mapper?branch=master) [![npm](https://img.shields.io/npm/dt/elasticsearch-mapper.svg?maxAge=2592000)](https://www.npmjs.com/package/elasticsearch-mapper) [![npm](https://img.shields.io/npm/v/elasticsearch-mapper.svg?maxAge=2592000)](https://www.npmjs.com/package/elasticsearch-mapper)
> Automatic mappings generator for ElasticSearch, JSON documents and MongoDB collections...


> Getting started with ElasticSearch is easy enough, and the powerful full-text search engine can do lots of stuff out of the box and this include dynamic mappings. Yes, you don't have to tell ElasticSearch what kind of data you want to index and it will handle it appropriately, well most of the time. But there are some occasions when you need to tell ElasticSearch the kind of data to expect so it can perform better (index and search) and not rely on too many generic fallbacks. That is where `elasticsearch-mapper` comes in.

> [Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) in ElasticSearch is somewhat complex and the aim of this package to make it simple by exposing APIs that can generate default mappings for you that work most of the time. It comes bundled with default configurations that will get you started in no time, no matter the kind of data you have (deeply nested JSON document search also supported).

## Installation

```bash
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

```javascript
var mapper = require('elasticsearch-mapper');

// register the Needs index
mapper.index('Needs');
// register books and foods types under Needs index. This creates mappings for the respective types
mapper.mapFromDoc('Needs', 'books', sampleBook); // if the specified index has not been registered beforehand, this will create the index on the fly and register the required mapping
mapper.mapFromDoc('Needs', 'foods', sampleFood);

```


#### Mapping from mongoDB collection

It is also possible to generate mappings directly from mongoDB collections. The step is as simple as generating mappings from JSON documents.

```javascript
var mapper = require('elasticsearch-mapper');

// register the Needs index
mapper.index('Needs');
// register books and foods types under Needs index. This creates mappings for the respective types
mapper.mapFromCollection(indexName, typeName, options, callBack); // if the specified index has not been registered beforehand, this will create the index on the fly and register the required mapping
```

The `mapFromCollection` function takes four arguments.

- **indexName** - Name of ElasticSearch index mapping is to be registered to

- **typeName** - ElasticSearch type name for mappings

- **options** - Option object containing mongo connection values. A sample option is shown below. The config property is only meant for customization and can be left out of the object most times. Check [Advanced Set-up](#not-so-super-simple-set-up) for more about using the config array.

```javascript
var option = {
  mongoUrl: mongoUrl,
  collectionName: 'dogs',
  config: []
};
```

- **callBack** - CallBack function to be invoked with the generated mappings.

Complete function call

```javascript
var mapper = require('elasticsearch-mapper');
var indexName = 'Needs';
var typeName = 'dogs';

// register the Needs index
mapper.index(indexName);

var option = {
  mongoUrl: mongoUrl,
  collectionName: 'dogs'
};

mapper.mapFromCollecion(indexName, typeName, option, function (mapping) {
    // mapping is already registered in specified index, but returned if needed for further usage
    // do something with mapping
})
```



That's it! You now have a well defined index and types. This quick index and mappings creation process makes use of some default settings which works most of the time. To have a look of what was created in the index and mappings, you can fetch the index like below:

```javascript
var index = mapper.getIndex('Needs');
```

The query above will return the object similar to what is below:

```javascript

{  
  settings: {  
    'index.mapper.dynamic': false,
    analysis: {  
      filter: {  
        edgeNGram_filter: {  
          type:'edgeNGram',
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
  mappings: {  
    books: {  
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
        author: {  
          type: 'object',
          properties: {  
            name: {  
              type: 'string',
              index_analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            profession: {  
              type: 'string',
              index_analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            hobbies: {  
              type: 'string',
              index_analyzer: 'edgeNGram_analyzer',
              search_analyzer: 'whitespace_analyzer'
            },
            dob: {  
              type: 'date',
              index: 'no'
            }
          }
        },
        ISBN: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        pages: {  
          type: 'double',
          index: 'no'
        },
        category: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        }
      }
    },
    foods: {  
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
        origin: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        class: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        colour: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        supportFood: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'whitespace_analyzer'
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
    index: 'Needs',
    body: mapper.getIndex('Needs'),
    update_all_types: true
  }, function (error, response, responseCode) {  
        // some other code here...
  }
});
```

Expecting more steps? Sorry to disappoint you. That is all you need to get a working and valid ElasticSearch index from sample data.


### Not so super simple set-up

With the same data as what is above, but you want to go several steps forward and customize what kind of analyzers and filters your index and types utilize. Or you don't want all string fields to be indexed to reduce cluster space and also to get more relevant search results, `elasticsearch-mapper` is also customizable in that regard. You can add your custom analyzers and filters to each index or on the package level. You can also configure fields in the same type use different analyzers (custom or default). You can also specify if a field should be stored as it is (the field won't be tokenized and also make any query for the field to match the full field content).

We still make use of the JSON documents, but with different configurations.

```javasript
var mapper = require('elasticsearch-mapper');
```

So you have a couple of filters you want to add. There are two ways of doing this. The first way is adding those filters and analyzers on package level, that is before registering any index. This ensures that all subsequent index you register will inherit the additional analyzers and filters. Below, we are adding two extra analyzers and a filter on the package level. This is done by calling the `configure` method.

```javascript
mapper.configure({
  filters: {
    "my_delimiter": {
      type: 'word_delimiter',
      generate_word_parts: true,
      catenate_words: true,
      catenate_numbers: true,
      catenate_all: true,
      split_on_case_change: true,
      preserve_original: true,
      split_on_numerics: true,
      stem_english_possessive: true
    }
  },
  analyzers: {
    custom_index_analyzer: {
      tokenizer: 'standard',
      filter: ['standard', 'my_delimiter', 'lowercase', 'stop', 'asciifolding', 'porter_stem']
    },
    custom_search_analyzer: {
      tokenizer: 'standard',
      filter: ['standard', 'lowercase', 'stop', 'asciifolding', 'porter_stem']
    }
  }
});
```

To see the result of the snippet above, you can use `getDefaultConfig` method to get the package level configurations.

Calling `getDefaultConfig` before adding custom analyzers and filers will return something similar to what is below

```javascript
mapper.getDefaultConfig();

// will return the following JSON Data

{  
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
}

```

Calling `getDefaultConfig` after adding custom analyzers and filters will return the updated configurations.

```javascript
mapper.getDefaultConfig();

// will return the following JSON Data

{  
  'index.mapper.dynamic': false,
  analysis: {  
    filter: {  
      edgeNGram_filter: {  
        type: 'edgeNGram',
        min_gram: 3,
        max_gram: 15,
        token_chars: ['letter', 'digit', 'punctuation', 'symbol']
      },
      my_delimiter: {  
        type: 'word_delimiter',
        generate_word_parts: true,
        catenate_words: true,
        catenate_numbers: true,
        catenate_all: true,
        split_on_case_change: true,
        preserve_original: true,
        split_on_numerics: true,
        stem_english_possessive: true
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
      },
      custom_index_analyzer: {  
        tokenizer: 'standard',
        filter: ['standard', 'my_delimiter', 'lowercase', 'stop', 'asciifolding', 'porter_stem']
      },
      custom_search_analyzer: {  
        tokenizer: 'standard',
        filter: ['standard', 'lowercase', 'stop', 'asciifolding', 'porter_stem']
      }
    }
  }
}

```

Now that we have defined custom analyzers, it is time to create type mappings fro the `books` and `foods` collection and customize to our needs. 
In the `books` type mapping, we only want three fields to be indexed and searched. The fields are `name`, `ISBN`, and the `name` field in the `author` nested object. 
In the `foods` type mapping, we only want all fields to be indexed, but in different ways. For example, we don't want the `supportFood` field to be analyzed, and we want to use different analyzers for other fields, except for the colour field which should not be indexed. All these are super easy to do in `elasticsearch-mapper`.

```javascript
// this assumes we continue with the newly added custom analyzers

// sample data from mongoDB ollections
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

// register the Needs index
mapper.index('Needs');

// now we will define two config arrays that defines how the custom mapping should be created
var bookConfig = [{
    field: 'name',
    tokenize: true
  }, {  
    field: 'ISBN',
    tokenize: false
  }, {  
    field: 'author.name',
    tokenize: true,
    index: 'custom_index_analyzer',
    search: 'custom_search_analyzer'
  }
];
var foodConfig = [{
    field: 'name',
    tokenize: true,
    index: 'custom_index_analyzer'
  }, {
    field: 'origin',
    tokenize: true,
    search: 'custom_search_analyzer'
  }, {  
    field: 'supportFood',
    tokenize: false
  }, {  
    field: 'class',
    tokenize: true,
    index: 'custom_index_analyzer',
    search: 'custom_search_analyzer'
  }
];


// register books and foods types under Needs index. This creates mappings for the respective types using the config passed
mapper.mapFromDoc('Needs', 'books', sampleBook, bookConfig); // if the specified index has not been registered beforehand, this will create the index on the fly and register the required mapping
mapper.mapFromDoc('Needs', 'foods', sampleFood, foodConfig);


// Then use getIndex() to see the result of the config.

mapper.getIndex(); // will return the object below



{  
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
  mappings: {  
    books: {  
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
        author: {  
          type: 'object',
          properties: {  
            name: {  
              type: 'string',
              index_analyzer: 'custom_index_analyzer',
              search_analyzer: 'custom_search_analyzer'
            },
            profession: {  
              type: 'string',
              index: 'no'
            },
            hobbies: {  
              type: 'string',
              index: 'no'
            },
            dob: {  
              type: 'date',
              index: 'no'
            }
          }
        },
        ISBN: {  
          type: 'string',
          index: 'not_analyzed'
        },
        pages: {  
          type: 'double',
          index: 'no'
        },
        category: {  
          type: 'string',
          index: 'no'
        }
      }
    },
    foods: {  
      _all: {  
        enabled: false
      },
      dynamic: 'false',
      properties: {  
        name: {  
          type: 'string',
          index_analyzer: 'custom_index_analyzer',
          search_analyzer: 'whitespace_analyzer'
        },
        origin: {  
          type: 'string',
          index_analyzer: 'edgeNGram_analyzer',
          search_analyzer: 'custom_search_analyzer'
        },
        class: {  
          type: 'string',
          index_analyzer: 'custom_index_analyzer',
          search_analyzer: 'custom_search_analyzer'
        },
        colour: {  
          type: 'string',
          index: 'no'
        },
        supportFood: {  
          type: 'string',
          index: 'not_analyzed'
        }
      }
    }
  }
}

```

You will notice in the above index object that the mappings are generated based on what was passed as config for each field. It should also be noted that whenever configArray is passed to `mapFromDoc`, `elasticsearch-mapper` only work on the specified fields. All other fields will be set as `index: 'no'`. It should also be noticed that default values are applied to `index` and `search` if any of them is no defined. The index can then be sent to a running ElasticSearch cluster.

## Important info

Starting from ElasticSearch `2.0`, it is no longer possible to have fields with the same name, in different mappings but in the same index have different data type. What this means is that in the `Needs` index above, the name field in `foods` mapping and name field in `books` mapping can't have different data types, else an error will be thrown. Due to this, `elasticsearch-mapper` also enforces this rule and does not allow such fields to hold different data types. An error will thrown if that happens.

## APIs

### clear()
Resets package to clean state.


### configure(configOptions)
Add custom filters and analyzers.


#### configOptions

Required  
Type: `object`

Object containing analyzers and filters to add to package



### index(indexName)
Add an index to the mapper


#### indexName

Required  
Type: `string`

Name of index to register



### getIndex(indexName)
Retrieve an already registered index


#### indexName

Required  
Type: `string`

Name of index to fetch



### enableIndexLevelDynamicMappings(indexName, status)
Enables index-level dynamic mapping. This disables type dynamic mappings toggling


#### indexName

Required  
Type: `string`

Name of index to enable index level dynamic mapping for


#### status

Type: `boolean`  
Default: `false`

If passed in, then index dynamic status will be set to passed in value, else defaults to false


### disableIndexLevelDynamicMappings(indexName)
Enables index-level dynamic mapping. This enables type dynamic mappings toggling


#### indexName

Required  
Type: `string`

Name of index to disable index level dynamic mapping for


### dynamicMapping(indexName, status)
Sets if dynamic mapping is enabled or disabled in the specified index. It also changes dynamic mapping status for each typ registered under specified index.


#### indexName

Required  
Type: `string`

Name of index to enable or disable dynamic mapping for


#### status

Type: `boolean`  
Default: `false`

If passed in, then index dynamic status will be set to passed in value, else defaults to false


### typeDynamicMapping(indexName, type, status)
Sets dynamic mappings for type in specified index. This only works if index level dynamic mappings has been disabled


#### indexName

Required  
Type: `string`

Name of index to get type for


#### type

Required  
Type: `string`

Name of type to set dynamic mappings for


#### status

Required  
Type: `boolean`  
Default: `false`

If passed in, then type dynamic status will be set to passed in value, else defaults to false



### mapFromCollection(indexName, typeName, options, callBack)


#### indexName

Required  
Type: `string`

Name of index to create type and mapping for


#### typeName

Required  
Type: `string`

Name of type to create and attach mapping to


#### options

Required  
Type: `object`

object containing mongoDB parameters. Sample object is shown below


```javascript
var option = {
  mongoUrl: mongoUrl,
  collectionName: collectionName,
  config: []
};
```


#### callBack

Required  
Type: `function`  

Callback to call with generated mapping.



### mapFromDoc(indexName, typeName, document, config)
Create a type and attach mapping object (generated from specified JSON document and config)


#### indexName

Required  
Type: `string`

Name of index to create type and mapping for


#### typeName

Required  
Type: `string`

Name of type to create and attach mapping to


#### document

Required  
Type: `object`

Document to use for mapping generation


#### config

Type: `array`

Array containing mapping fields settings (if empty, all string fields will be indexed and searchable). Sample array is below

```javascript
[
  {
    field: 'name',
    tokenize: true
  }, {  
    field: 'ISBN',
    tokenize: false
  }, {  
    field: 'author.name',
    tokenize: true,
    index: 'custom_index_analyzer',
    search: 'custom_search_analyzer'
  }
];
```


### indexCount()
Returns number of indices registered


### getMappings(indexName)
Returns all mappings registered under specified index


#### indexName

Required  
Type: `string`

Name of index to retrieve mappings from



### getSingleMapping(indexName, mappingName)
Returns single mapping from specified index


#### indexName

Required   
Type: `string`   

Name of index to retrieve mapping from


#### mappingName

Required  
Type: `string`

Name of mapping to retrieve


## TODO

- **addFilter(indexName, filterObject)** - To add user defined filter to specified index
- **removeFilter(indexName, filterName)** - To remove filter from index. This will go deep into all analyzers and remove the filter from any analyzer where it is being used

- **addAnalyzer(indexName, analyzerObject)** - To add user defined analyzer to specified index
- **removeAnalyzer(indexName, analyzerName)** - To remove analyzer from index. THis will go deep to all mappings and change every field that uses the removed analyzer to the default `edgeNGram_analyzer` (index) and `whitespace_analyzer` (search) analyzer



## Contributing

Contributions are **welcome** and will be fully **credited**. Check [CONTRIBUTORS](CONTRIBUTORS.md) for more information.

Contributions are accepted via Pull Requests on [Github](https://github.com/toystars/elasticsearch-mapper).


## Test

Run tests with `npm run cover`


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

