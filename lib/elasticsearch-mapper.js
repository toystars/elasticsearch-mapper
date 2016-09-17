/*!
 * elasticsearch-mapper
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';


/*
 *  Dependencies
 * */
var _ = require('underscore'),
  inspector = require('util'),
  defaultConfig = require('./config/default-settings');



/*
* Private variables
* */
var Mapper = {};
Mapper.Indices = {};



/**
 * clear
 * @summary resets mapper module to clean state
 */
var clear = function () {
  Mapper.Indices = {};
};



/**
* index
* @summary Add an index to the mapper
* @param {String} indexName - name of index to register
* @param {Object} config - config object to be used for index settings
*/
var index = function (indexName, config) {


  Mapper.Indices[indexName] = {
    settings: config ? config : defaultConfig,
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
 * indexCount
 * @summary returns number of indices registered
 */
var indexCount = function () {
  return Object.keys(Mapper.Indices).length;
};



module.exports = {
  clear: clear,
  index:  index,
  getIndex: getIndex,
  indexCount: indexCount
};


