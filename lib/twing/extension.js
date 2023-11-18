"use strict";

const {TwingExtension} = require('twing');
const {makeExtensionClass} = require('../utils');

class DoxsTwingExtension extends TwingExtension
{
  constructor(doxsParser, options)
  {
    super();
    this.doxs = doxsParser;
    this.$doxsExtOptions = options;
  }
}

module.exports = makeExtensionClass(DoxsTwingExtension);
