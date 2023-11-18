"use strict";

const {makeExtensionClass} = require('../utils');

class DoxsMarkedExtension
{
  constructor(doxsParser, options)
  {
    this.doxs = doxsParser;
    this.$doxsExtOptions = options;
  }

  get handler()
  {
    throw new Error("Abstract getter `handler` not implemented");
  }
}

module.exports = makeExtensionClass(DoxsMarkedExtension);
