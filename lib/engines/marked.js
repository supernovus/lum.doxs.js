"use strict";

const core = require('@lumjs/core');
const {F} = core.types;
const {Marked} = require('marked');
const Plugin = require('../marked/extension');
const Engine = require('./engine');

class MarkedEngine extends Engine
{
  constructor(doxsParser, options={})
  {
    super(doxsParser, options);
    this.marked = new Marked(options);
  }

  get ExtensionBaseClass()
  {
    return Plugin;
  }

  usePlugin(plugin)
  {
    if (typeof plugin === F)
    { // It's a plugin constructor.
      plugin = new plugin(this);
    }
    this.marked.use(plugin.handler);
  }

  handleDoc(doc)
  {
    return this.marked.parse(doc.content);
  }

  getTagHandler()
  {
    return (_, tagContent) => 
    {
      return this.marked.parse(tagContent);
    }
  }

}

module.exports = MarkedEngine;
