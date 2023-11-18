"use strict";

const core = require('@lumjs/core');
const {S,F} = core.types;
const loadDefaults = require('./defaults');
const DoxsDocument = require('./document');

/**
 * A class supporting Twig, Markdown, Textile, and more; all in one document!
 * 
 * @alias @lumjs/doxs/parser
 */
class DoxsParser
{
  constructor(options={})
  {
    this.engines = [];
    const plugins 
      = Array.isArray(options.plugins)
      ? options.plugins
      : loadDefaults(this, options);
    this.use(...plugins);
  }

  use(...plugins)
  {
    for (let plugin of plugins)
    {
      if (typeof plugin === F && DoxsEngine.isPrototypeOf(plugin))
      {
        plugin = new plugin(this);
      }

      if (plugin instanceof DoxsEngine)
      {
        this.engines.push(plugin);
      }
      else
      { // Assume it is a plugin for one of the engines already loaded.
        for (const engine of this.engines)
        {
          if (engine.handles(plugin))
          {
            engine.usePlugin(plugin);
          }
        }
      }
    }
  }

  /**
   * Build a new Document object.
   * 
   * @param {string} content - The document content text.
   * @param {object} [data]  - Initial document data.
   * @returns {DoxsDocument} - A document object instance.
   */
  load(content, data)
  {
    return new DoxsDocument(this, content, data);
  }

  /**
   * Parse a document.
   * 
   * @param {(string|DoxsDocument)} doc - The document to parse.
   * @param {object} [data] - Initial data if `content` is a string.
   * Not used if `content` is a document object instance.
   * @returns {string} The parsed document HTML.
   */
  parse(doc, data)
  {
    if (typeof doc === S)
    {
      doc = this.load(doc, data);
    }
    else if (!(doc instanceof DoxsDocument))
    {
      console.error({content: doc, data, arguments, parser: this});
      throw new TypeError('Invalid content');
    }

    for (const engine of this.engines)
    {
      engine.parse(doc);
    }

    return doc.content;
  }

} // DoxsParser class

module.exports = DoxsParser;

const DoxsEngine = require('./engines/engine');
