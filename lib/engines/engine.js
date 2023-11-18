"use strict";

const core = require('@lumjs/core');
const {S,F,isObj} = core.types;
const {replaceAsync} = require('../utils');

/**
 * An abstract class for a rendering engine that can be used in Doxs.
 */
class DoxsEngine
{
  constructor(doxsParser, options={})
  {
    this.options = options;
    this.tagName = options.tagName;
    if (doxsParser instanceof DoxsParser)
    {
      this.$doxs = doxsParser;
    }
  }

  static new(options, doxsParser)
  {
    return new this(options, doxsParser);
  }

  get doxs()
  {
    return this.$doxs;
  }

  set doxs(obj)
  {
    if (obj instanceof DoxsParser)
    {
      this.$doxs = obj;
    }
    else
    {
      console.error({obj, engine: this});
      throw new TypeError("Invalid DoxsParser");
    }
  }

  parse(doc)
  {
    if (typeof this.tagName === S)
    {
      return this.parseTag(doc);
    }
    else
    {
      return this.parseDoc(doc);
    }
  }

  usePlugin(plugin)
  {
    throw new Error("Abstract method `usePlugin()` not implemented");
  }

  handleDoc(doc)
  {
    throw new Error("Abstract method `handleDoc()` not implemented");
  }

  getTagHandler(doc)
  {
    throw new Error("Abstract method `getTagHandler()` not implemented");
  }

  get ExtensionBaseClass()
  {
    return null;
  }

  handles(plugin)
  {
    const base = this.ExtensionBaseClass;
    if (base)
    {
      return base.isDoxsExt(plugin);
    }
    return false;
  }

  get tagRegExp()
  {
    const tag = this.tagName;
    if (typeof tag === S)
    {
      return new RegExp(`<${tag}>(.*?)</${tag}>`, 'gs');
    }
    else
    {
      return null;
    }
  }

  $setDocIf(doc, output)
  {
    if (typeof output === S && output.trim() !== '')
    {
      doc.setContent(output);
    }
  }

  parseDoc(doc)
  {
    const output = this.handleDoc(doc);
    this.$setDocIf(doc, output);
    return doc;
  }

  parseTag(doc)
  {
    const re = this.tagRegExp;
    const fn = this.getTagHandler(doc);

    if (re instanceof RegExp && typeof fn === F)
    {
      const output = doc.content.replaceAll(re, fn);
      this.$setDocIf(doc, output);
    }
    else
    {
      console.error("Invalid or unsupported call to <Default> parseTag()");
    }
    return doc;
  }

}

class DoxsAsyncEngine extends DoxsEngine
{
  async parse(doc)
  {

  }
  
  async parseDoc(doc)
  {
    return this.handleDoc(doc).then(output => 
    {
      console.debug("Output.then", {output, doc});
      this.$setDocIf(doc, output)
    });
  }

  async parseTag(doc)
  {
    const re = this.tagRegExp;
    const fn = this.getTagHandler(doc);

    if (re instanceof RegExp && typeof fn === F)
    {
      const output = await replaceAsync(doc.content, regExp, fn);
      this.$setDocIf(doc, output);
    }
    else
    {
      console.error("Invalid or unsupported call to <Async> parseTag()");
    }
    return doc;
  }
}

DoxsEngine.Async = DoxsAsyncEngine;
module.exports = DoxsEngine;

const DoxsParser = require('../parser');
