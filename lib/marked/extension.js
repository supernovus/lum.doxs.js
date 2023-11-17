"use strict";

const core = require('@lumjs/core');
const {def,isObj} = core.types;

function makeExtension(object)
{
  return def(object, '$$doxsMarkedPlugin$$', {value: true});
}

function isDoxsMarked(what)
{
  return (isObj(what) && what.$$doxsMarkedPlugin$$);
}

module.exports = 
{
  makeExtension,
  isDoxsMarked,
}
