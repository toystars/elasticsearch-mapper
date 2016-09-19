/*!
 * elasticsearch-mapper
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';


/*
 *  Dependencies
 * */
var _ = require('lodash'),
  inspector = require('util'),
  mappers = require('./helpers/mappers'),
  defaultConfig = require('./config/default-settings');



/*
* Private variables
* */
var Mapper = {};
Mapper.Indices = {};
Mapper.defaultConfig = _.cloneDeep(defaultConfig);



/**
 * configure
 * @summary Add filters and analyzers to Mapper
 * @param {Object} configObject - object containing analyzers ad filters
 */
var configure = function (configObject) {
  var filters = configObject.filters;
  var analyzers = configObject.analyzers;

  // validation to go here...


  if (filters) {
    var filterNames = Object.keys(filters);
    _.each(filterNames, function (filterName) {
      Mapper.defaultConfig.analysis.filter[filterName] = filters[filterName];
    });
  }

  if (analyzers) {
    var analyzerNames = Object.keys(analyzers);
    _.each(analyzerNames, function (analyzerName) {
      Mapper.defaultConfig.analysis.analyzer[analyzerName] = analyzers[analyzerName];
    });
  }

};



/**
 * getDefaultConfig
 * @summary Returns default config
 * @return {Object} configuration object
 */
var getDefaultConfig = function () {
  return Mapper.defaultConfig;
};



/**
 * dynamicMapping
 * @summary Sets if dynamic mapping is enabled or disabled in the specified index
 * @param {String} indexName - name of index to enable or disable dynamic mapping for
 * @param {boolean} status - dynamic mapping status
 */
var dynamicMapping = function (indexName, status) {

  var index = getIndex(indexName);

  // check if index is registered
  if (!index) {
    throw new Error('Elastic Mapper - Index not found');
  }

  // check if index level dynamic mapping is allowed on index
  if (!index.settings.hasOwnProperty('index.mapper.dynamic')) {
    throw new Error('Elastic Mapper - Index level dynamic mapping is disabled in index. Enable index level dynamic mappings or use type level dynamic mappings');
  }

  index.settings['index.mapper.dynamic'] = status;
  // change dynamic mappings status for all mappings in specified index
  var mappings = index.mappings;
  var mappingKeys = Object.keys(mappings);
  _.each(mappingKeys, function (key) {
    mappings[key].dynamic = status ? 'true' : 'false';
  });
};



/**
 * typeDynamicMapping
 * @summary Sets dynamic mappings for type in specified index. This only works if index level dynamic mappings has been disabled
 * @param {String} indexName - name of index to get type mappings from
 * @param {String} type - name of type to set dynamic mappings for
 * @param {boolean} status - dynamic mappings status
 */
var typeDynamicMapping = function (indexName, type, status) {
  var index = getIndex(indexName);

  // check if index is registered
  if (!index) {
    throw new Error('Elastic Mapper - Index not found');
  }

  // check if index level dynamic mappings is enabled
  if (index.settings.hasOwnProperty('index.mapper.dynamic')) {
    throw new Error('Elastic Mapper - Index level dynamic mappings is active. Disable and try again');
  }

  // check if type is registered under index
  if (!index.mappings[type]) {
    throw new Error('Elastic Mapper - Type not found');
  }

  index.mappings[type].dynamic = String(status);
};



/**
 * enableIndexLevelDynamicMappings
 * @summary Enables index level dynamic mappings for index. This ensures that dynamic mapping for all types registered under index can be altered using the dynamicMapping method
 * @param {String} indexName - name of index to enabled index level dynamic mappings for
 * @param {boolean} status - optional status (defaults to false it not provided)
 */
var enableIndexLevelDynamicMappings = function (indexName, status) {
  var index = getIndex(indexName);

  // check if index is registered
  if (!index) {
    throw new Error('Elastic Mapper - Index not found');
  }

  if (!index.settings.hasOwnProperty('index.mapper.dynamic')) {
    index.settings['index.mapper.dynamic'] = !!status;
  }
};



/**
 * disableIndexLevelDynamicMappings
 * @summary Disables index level dynamic mappings for index. This will make all dynamic mappings configuration to be done only on type level.
 * @param {String} indexName - name of index to disable index level dynamic mappings for
 */
var disableIndexLevelDynamicMappings = function (indexName) {
  var index = getIndex(indexName);

  // check if index is registered
  if (!index) {
    throw new Error('Elastic Mapper - Index not found');
  }

  if (index.settings.hasOwnProperty('index.mapper.dynamic')) {
    delete index.settings['index.mapper.dynamic'];
  }
};



/**
 * clear
 * @summary Resets mapper module to clean state
 */
var clear = function () {
  Mapper = {};
  Mapper.Indices = {};
  Mapper.defaultConfig = _.cloneDeep(defaultConfig);
};



/**
* index
* @summary Add an index to the mapper
* @param {String} indexName - name of index to register
*/
var index = function (indexName) {
  // validation to go here...

  Mapper.Indices[indexName] = {
    settings: Mapper.defaultConfig,
    mappings: {}
  };
};



/**
 * getIndex
 * @summary Retrieve an already registered index
 * @param {String} indexName - name of index to retrieve
 * @return {Object} index object matching the specified name, undefined if no matching index is found
 */
var getIndex = function (indexName) {
  return Mapper.Indices[indexName];
};



/**
 * mapFromDoc
 * @summary Create a type and attach mapping object (generated from specified JSON document and config)
 * @param {String} indexName - name of index to create type and mapping for
 * @param {String} typeName - name of type to create and attach mapping to
 * @param {Object} document - document to use for mapping generation
 * @param {Array} config - array containing mapping fields settings (if empty, all string fields will be indexed and searchable)
 * @return {Object} mapping
 */
var mapFromDoc = function (indexName, typeName, document, config) {
  // validation to go here...

  // if index is has not been registered beforehand, create it dynamically
  if (!getIndex(indexName)) {
    index(indexName);
  }
  var mapping = mappers.createMappingsFromJSON(document, Mapper.Indices[indexName].settings, config);
  Mapper.Indices[indexName].mappings[typeName] = mapping;
  return mapping;
};



/**
 * indexCount
 * @summary returns number of indices registered
 */
var indexCount = function () {
  return Object.keys(Mapper.Indices).length;
};



/**
 * getMappings
 * @summary Returns all mappings registered under specified index
 * @param {String} indexName - name of index to retrieve mappings from
 * @return {Object} mappings objects
 */
var getMappings = function (indexName) {
  var index = getIndex(indexName);

  // check if index is registered
  if (!index) {
    throw new Error('Elastic Mapper - Index not found');
  }

  return index.mappings;
};



/**
 * getSingleMapping
 * @summary Returns single mapping from specified index
 * @param {String} indexName - name of index to retrieve mapping from
 * @param {String} mappingName - name of mapping to retrieve
 * @return {Object} mapping object
 */
var getSingleMapping = function (indexName, mappingName) {
  return getMappings(indexName)[mappingName];
};



module.exports = {
  clear: clear,
  configure: configure,
  getDefaultConfig: getDefaultConfig,
  enableIndexLevelDynamicMappings: enableIndexLevelDynamicMappings,
  disableIndexLevelDynamicMappings: disableIndexLevelDynamicMappings,
  dynamicMapping: dynamicMapping,
  typeDynamicMapping: typeDynamicMapping,
  index:  index,
  getIndex: getIndex,
  mapFromDoc: mapFromDoc,
  indexCount: indexCount,
  getMappings: getMappings,
  getSingleMapping: getSingleMapping
};


