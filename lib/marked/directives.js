"use strict";

const {createDirectives,presetDirectiveConfigs} = require('marked-directive');

const Extension = require('./extension');

class DoxsMarkedDirectives extends Extension
{
  get handler()
  {
    return createDirectives(this.doxsOptions);
  }

  get defaultDoxsOptions()
  {
    return [...presetDirectiveConfigs];
  }
}

module.exports = DoxsMarkedDirectives;
