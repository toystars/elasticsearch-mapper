/*!
 * elasticsearch-mapper/default-settings
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */


/*
* Defines default index settings that should work well with all kind of schema and data.
* This includes filters and analyzers (index and search) to be applied on the whole index.
* More filters and analyzers can be supplied when registering or updating index, and all including
* the default settings will be useable for each type in the index
*
* Dynamic mapping is disabled by default but can be toggled on and off on per-index level.
*
* The min_gram (minimum length of token to start indexing from) defaults to 3 because that makes search
* faster and more efficient by removing any irrelevant token mis-match. The max_gram can be changed on index level.
*
* All customization can only be done per index level
* */

module.exports = {
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
};