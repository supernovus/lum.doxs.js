"use strict";

const core = require('@lumjs/core');
const {F} = core.types;
const {TwingEnvironment, TwingLoaderArray} = require('twing');
const Plugin = require('../twing/extension');
const Engine = require('./engine');

class TwingEngine extends Engine.Async
{
  constructor(doxsParser, options={})
  {
    super(doxsParser, options);
    this.loader = options.loader ?? new TwingLoaderArray({});
    this.twing  = new TwingEnvironment(this.loader, options);
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
    this.twing.addExtension(plugin, plugin.name);
  }

  async handleDoc(doc)
  {
    return await this.$render(doc.id, doc.content, doc.data);
  }

  getTagHandler(doc)
  {
    let num=0;
    return (_, tagContent) => 
    {
      const id = doc.id+`:tag[${num++}]`;
      return this.$render(id, tagContent, doc.data);
    }
  }

  async $render(id, content, data)
  {
    const tl = this.loader;
    tl.setTemplate(id, content);
    return this.twing.render(id, data);
  }

}

module.exports = TwingEngine;
