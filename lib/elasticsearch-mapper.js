/*!
 * elasticsearch-mapper
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';


/*
 *  Dependencies
 * */
var _ = require('underscore');



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


  if (!config) {
    Mapper.Indices[indexName] = {
      settings: {},
      mappings: {}
    };
  }
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
  indexCount: indexCount
};
