"use strict";

const {createDirectives,presetDirectiveConfigs} = require('marked-directive');

const {makeExtension} = require('./extension');

module.exports = makeExtension(
{
  id: 'directives',
  register(parser, options)
  {
    this.parser = parser;
    return createDirectives(options.directives);
  },
  defaults: 
  {
    directives:
    [
      ...presetDirectiveConfigs,
    ],
  },
  libs:
  {
    createDirectives, presetDirectiveConfigs,
  },
});
