/*!
 * elasticsearch-mapper/mappers
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';

var inspector = require('util'),
  _ = require('lodash');


// function to return type of value
var getType = function (value, indexName, keyLog) {
  var object = {};
  if (_.isDate(value)) {
    object.type = 'date';
  } else if (_.isArray(value)) {
    var newValue = value[0];
    if (_.isDate(newValue)) {
      object.type = 'date';
    } else if (_.isObject(newValue)) {
      object.type = 'nested';
      object.properties = analyzeDoc(newValue, indexName, keyLog);
    } else if (typeof newValue === 'number') {
      object.type = 'double';
    } else {
      object.type = typeof newValue;
    }
  } else if (typeof value === 'object') {
    object.type = 'object';
    object.properties = analyzeDoc(value, indexName, keyLog);
  } else if (typeof value === 'number') {
    object.type = 'double';
  } else {
    object.type = typeof value;
  }
  return object;
};



/**
 * getKeyTypeValidity
 * @summary to prevent documents fields type mismatch
 * @param {string} fieldType - type of field to validate
 * @param {string} key - name of key to validate type for
 * @param {string} indexName - name of index to run validation on
 * @param {Object} keyLog - Object containing all unique keys in all the index registered to prevent type mismatch
 * @return {Object} mapping
 */
var getKeyTypeValidity = function (fieldType, key, indexName, keyLog) {
  var result = {
    valid: true
  };
  if (keyLog.hasOwnProperty(indexName)) {
    var logs = keyLog[indexName];
    var currentKeyLog = _.find(logs, function (log) {
      return log.key === key;
    });
    if (currentKeyLog) {
      if (currentKeyLog.type !== fieldType) {
        result.valid = false;
        result.validType = currentKeyLog.type;
      }
    } else {
      keyLog[indexName].push({
        key: key,
        type: fieldType
      });
    }
  } else {
    keyLog[indexName] = [{
      key: key,
      type: fieldType
    }];
  }
  return result;
};



/**
 * analyzeDoc
 * @summary analyze and create bare-bone mapping with only field type
 * @param {Object} document - JSON object to analyze
 * @param {string} indexName - name of index to check key log against
 * @param {Object} keyLog - Object containing all unique keys in all the index registered to prevent type mismatch
 * @return {Object} mapping
 */
var analyzeDoc = function (document, indexName, keyLog) {
  var object = {};
  for (var key in document) {
    if (document.hasOwnProperty(key) && key !== '_id') {
      var typeObject = getType(document[key], indexName, keyLog);
      var keyTypeValidity = getKeyTypeValidity(typeObject.type, key, indexName, keyLog);
      if (keyTypeValidity.valid) {
        object[key] = typeObject;
      } else {
        throw new Error('Elastic Mapper - Invalid data type for ' + key + ' field in ' + indexName + ' index. Expected ' + keyTypeValidity.validType + ', but found ' + typeObject.type);
      }
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


var handleInnerMappings = function (mapping, field) {

};


/**
 * configureCustomMap
 * @summary insert index and search properties and analyzers to mapping from user defined config
 * @param {Object} mapping - mapping to configure analyzers and filters for
 * @param {object} settings - index settings to be used to check if all analyzers passed in the config array are all registered
 * @param {Array} mapperConfig - user defined set of fields configuration to be used to generate mappings
 * @return {Object} complete mapping
 */
var configureCustomMap = function (mapping, settings, mapperConfig) {

  var keys = Object.keys(mapping);
  _.each(keys, function (key) {

    var step = mapping[key];
    if (step.type === 'string') {
      var mapConfig = _.find(mapperConfig, function (config) {
        return config.field === key;
      });
      if (mapConfig) {
        if (!mapConfig.tokenize) {
          step.index = 'not_analyzed';
        } else {
          step.index_analyzer = mapConfig.index ? settings.analysis.analyzer.hasOwnProperty(mapConfig.index) ? mapConfig.index : 'edgeNGram_analyzer' : 'edgeNGram_analyzer';
          step.search_analyzer = mapConfig.search ? settings.analysis.analyzer.hasOwnProperty(mapConfig.search) ? mapConfig.search : 'whitespace_analyzer' : 'whitespace_analyzer';
        }
      } else {
        step.index = 'no';
      }
    } else if (step.type === 'object' || step.type === 'nested') {
      var configArray = [];

      // pull all valid mapper configs
      _.each(mapperConfig, function (config) {
        var array = config.field.split('.');
        if (array[0] === key) {
          configArray.push(config);
        }
      });

      // reduce configArray to enable internal object mappings
      _.each(configArray, function (config) {
        var oldFieldArray = config.field.split('.');
        oldFieldArray.splice(0, 1);
        config.field = oldFieldArray.join('.');
      });

      step.properties = configureCustomMap(step.properties, settings, configArray);
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
   * @param {string} indexName - name of index to be used for field type validation
   * @param {Object} keyLog - Object containing all unique keys in all the index registered to prevent type mismatch
   * @return {Object} mapping object representing elasticsearch type
   */
  createMappingsFromJSON: function (document, settings, mapperConfig, indexName, keyLog) {
    var mapping = analyzeDoc(document, indexName, keyLog);
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
      finalMapping.properties = configureCustomMap(mapping, settings, mapperConfig);
    } else {
      finalMapping.properties = configureDefaultMap(mapping);
    }

    return finalMapping;
  }

};


