/*!
 * elasticsearch-mapper/mappers
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';

var inspector = require('util'),
  _ = require('underscore');


// function to return type of value
var getType = function (value) {
  var object = {};
  if (_.isDate(value)) {
    object.type = 'date';
  } else if (_.isArray(value)) {
    var newValue = value[0];
    if (_.isDate(newValue)) {
      object.type = 'date';
    } else if (_.isObject(newValue)) {
      object.type = 'nested';
      object.properties = analyzeDoc(newValue);
    } else if (typeof newValue === 'number') {
      object.type = 'double';
    } else {
      object.type = typeof newValue;
    }
  } else if (typeof value === 'object') {
    object.type = 'object';
    object.properties = analyzeDoc(value);
  } else if (typeof value === 'number') {
    object.type = 'double';
  } else {
    object.type = typeof value;
  }
  return object;
};


/**
 * analyzeDoc
 * @summary analyze and create bare-bone mapping with only field type
 * @param {Object} document - JSON object to analyze
 * @return {Object} mapping
 */
var analyzeDoc = function (document) {
  var object = {};
  for (var key in document) {
    if (document.hasOwnProperty(key) && key !== '_id') {
      object[key] = getType(document[key]);
    }
  }
  return object;
};



/**
 * configureDefaultMap
 * @summary insert index and search properties and analyzers to mapping
 * @param {Object} mapping - mapping to configure analyzers and filters for
 * @return {Object} complete mapping
 */
var configureDefaultMap = function (mapping) {
  var keys = Object.keys(mapping);
  _.each(keys, function (key) {
    var step = mapping[key];
    if (step.type === 'string') {
      step.index_analyzer = 'edgeNGram_analyzer';
      step.search_analyzer = 'whitespace_analyzer';
    } else if (step.type === 'object' || step.type === 'nested') {
      step.properties = configureDefaultMap(step.properties);
    } else {
      step.index = 'no';
    }
  });
  return mapping;
};


module.exports = {


  /**
   * createMappingsFromJSON
   * @summary create type mapping from a JSON document
   * @param {Object} document - JSON object to generate mapping from
   * @param {Object} settings - index settings object containing all analyzers and filters
   * @param {Array} mapperConfig - config array containing mapper field settings (what fields to index and make searchable)
   * @return {Object} mapping object representing elasticsearch type
   */
  createMappingsFromJSON: function (document, settings, mapperConfig) {
    var mapping = analyzeDoc(document);
    var finalMapping = {
      _all: {
        enabled: false
      },
      dynamic: settings.hasOwnProperty('index.mapper.dynamic') ? settings['index.mapper.dynamic'] ? 'true' : 'false' : 'false'
    };
    // configure mapping fields based on passed in mapperConfig
    // if no mapperConfig is passed, then all string fields will be configured to be indexed and searchable
    // also, the default index and search analyzers will be applied
    if (mapperConfig && _.isArray(mapperConfig) && mapperConfig.length > 0) {

    } else {
      finalMapping.properties = configureDefaultMap(mapping);
    }

    return finalMapping;
  }

};


/*
 "customerNumber": {
 "type": "string",
 "index": "not_analyzed"
 },

 console.log(inspector.inspect(mapping, {showHidden: false, depth: null}));
 console.log(inspector.inspect(finalMapping, {showHidden: false, depth: null}));

 *
 * */