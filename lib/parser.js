"use strict";

const core = require('@lumjs/core');
const {S,F,isObj} = core.types;
const {composeOptions, replaceAsync} = require('./utils');
const {Marked} = require('marked');
const textile = require('textile-js');
const {TwingEnvironment, TwingLoaderArray} = require('twing');
const YAML = require('yaml');
const DEFAULTS = require('./defaults');
const DoxsDocument = require('./document');
const {isDoxsMarked} = require('./marked/extension');
const {isDoxsTwing} = require('./twing/extension');

const CONSTRUCTOR_DEFAULTS =
[
  'frontMatter',
  'twingTag',
  'markedTag',
  'textileTag',
];

/**
 * A class supporting Twig, Markdown, and Textile formats all at once.
 * @alias @lumjs/doxs/parser
 */
class DoxsParser
{
  /**
   * Build a Parser object
   * 
   * @param {object} [options] Options for the parser.
   * 
   * @param {(string|boolean)} [options.frontMatter=false] Process FrontMatter?
   * 
   * If this is a `string` it will be the property name to add to the
   * document data. If it is `true` the FrontMatter will be merged with
   * any existing document data using `Object.assign()`.
   * If it is `false` we won't process FrontMatter at all.
   * 
   * @param {object} [options.yaml] Options for YAML library.
   * 
   * This will be passed to the `YAML.parse()` method when processing a
   * FrontMatter section. There may also be a few custom options added.
   * 
   * @param {string[]} [options.yaml.docEndMarkers] FrontMatter end markers.
   * 
   * A FrontMatter section must *start* with `---`, and this option defines
   * which lines may be used to mark the *end* of the FrontMatter section.
   * 
   * The default if not specified is `['---','...','']`; the last value
   * meaning a blank line will end the FrontMatter header section.
   * 
   * @param {string[]} [options.parseOrder] The order parsing will be done in.
   * 
   * This does not affect FrontMatter which if used will always be done first.
   * 
   * The `DEFAULTS.PARSERS` constant contains single-letter codes to use here:
   * 
   * | Code | Parser       | Scope       | Description            |
   * | ---- | ------------ | ----------- | ---------------------- |
   * | `T`  | `twing`      | `*`         | Document-wide Twig     |
   * | `M`  | `marked`     | `*`         | Document-wide Markdown |
   * | `X`  | `textile-js` | `*`         | Document-wide Textile  |
   * | `t`  | `twing`      | `<tw></tw>` | Twig tags              |
   * | `m`  | `marked`     | `<md></md>` | Markdown tags          |
   * | `x`  | `textile`    | `<tx></tx>` | Textile tags           |
   * 
   * The Scope _tags_ above are the default tags used, they may be
   * overridden via `twingTag`, `markedTag`, and `textileTag` options.
   * 
   * The default `parseOrder` is `[T, x, M]`;
   * 
   * @param {string} [options.twingTag='tw'] Tag name for Twig blocks.
   * @param {string} [options.markedTag='md'] Tag name for Markdown blocks.
   * @param {string} [options.textileTag='tx'] Tag name for Textile blocks.
   * @param {object} [options.textile] Options for Textile parser.
   * @param {object} [options.marked] Options for Markdown parser.
   * @param {object} [options.twing] Options for the Twing parser.
   * @param {object} [options.domPurify=null] Options for `DOMPurify.sanitize()`
   * If `null` then `DOMPurify` won't be used. Set to `{}` for default options.
   * 
   */
  constructor(options={})
  {
    const yamlOpts    = composeOptions(options, 'yaml');
    const textileOpts = composeOptions(options, 'textile');
    const markedOpts  = composeOptions(options, 'markdown', 'marked');
    const twingOpts   = composeOptions(options, 'twig',     'twing');

    this.yamlOpts = yamlOpts;
    this.yamlDocEnds = yamlOpts.docEndMarkers ?? [...DEFAULTS.yamlDocEnds, ''];
    this.parseOrder  = options.parseOrder     ?? [...DEFAULTS.parseOrder];

    for (const prop of CONSTRUCTOR_DEFAULTS)
    {
      this[prop] = options[prop] ?? DEFAULTS[prop];
    }

    this.textile = textile;
    this.textileOpts = textileOpts;

    this.marked = new Marked(markedOpts);
    this.markedOpts = markedOpts;

    this.twingLoader = twingOpts.loader ?? new TwingLoaderArray({});
    this.twingEnv = new TwingEnvironment(this.twingLoader, twingOpts);
    this.twingOpts = twingOpts;

    this.domPurifyOpts = options.domPurify ?? null;

    const plugins = options.plugins ?? DEFAULTS.PLUGINS;
    if (Array.isArray(plugins))
    {
      this.use(...plugins);
    }
  }

  use(...plugins)
  {
    for (let plugin of plugins)
    {
      if (isDoxsMarked(plugin))
      { // A Doxs-ready Marked plugin.
        const options = composeOptions(
          this.markedOpts, 
          plugin.defaults, 
          plugin.id);

        //console.debug("use", {plugin, options});

        this.marked.use(plugin.register(this, options));
      }
      else if (isDoxsTwing(plugin))
      { // A Doxs-ready Twing extension.
        if (typeof plugin === F)
        { // It's a plugin constructor.
          plugin = new plugin(this);
        }
        this.twingEnv.addExtension(plugin, plugin.name);
      }
      else
      {
        console.error({plugin});
        throw new TypeError("Unknown plugin type");
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
  async parse(doc, data)
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

    if (this.frontMatter)
    {
      this.$frontMatter(doc);
    }

    for (const meth of this.parseOrder)
    {
      let res;
      if (typeof meth === F)
      {
        res = meth.call(this, doc);
      }
      else if (typeof meth === S && typeof this[meth] === F)
      {
        res = this[meth](doc);
      }

      if (res instanceof Promise)
      {
        await res;
      }
    }

    if (isObj(this.domPurifyOpts))
    {
      this.$domPurify(doc);
    }

    return doc.content;
  }

  $domPurify(doc)
  {
    const DOMPurify = require('isomorphic-dompurify');
    const output = DOMPurify.sanitize(doc.content, this.domPurifyOpts);
    if (output)
    {
      doc.setContent(output);
    }
  }

  $frontMatter(doc)
  {
    if (doc.content.substring(0, 3) === '---')
    { // It's got FrontMatter.
      const docLines = doc.content.split("\n");
      const yamlLines = [docLines.shift()];

      while (docLines.length > 0)
      {
        const line = docLines.shift();
        if (this.yamlDocEnds.includes(line))
        { // A doc end marker was found.
          break;
        }
        else
        {
          yamlLines.push(line);
        }
      }

      doc.setContent(docLines.join("\n"));

      const yamlText = yamlLines.join("\n");
      const yamlData = YAML.parse(yamlText, this.yamlOpts);

      if (typeof this.frontMatter === S)
      { // Add the frontmatter as a nested property.
        doc.setData(this.frontMatter, yamlData);
      }
      else if (this.frontMatter === true)
      { // Add the frontmatter as extra doc data.
        doc.setData(yamlData);
      }
      else
      { // That's not valid.
        console.error({doc, frontMatter: this.frontMatter, parser: this});
      }
    }
  }

  async $renderTwing(id, content, data, fn)
  {
    const tl = this.twingLoader;
    tl.setTemplate(id, content);
    return this.twingEnv.render(id, data)
      .then(fn)
      .catch(error => 
        console.error({error, id, content, data, parser: this}));
  }

  async $twingDoc(doc)
  { // Render with twing, and replace the document content.
    return this.$renderTwing(doc.id, doc.content, doc.data, output =>
    {
      if (typeof output === S && output.trim() !== '')
      { 
        doc.setContent(output);
      }
    });
  }

  $markedDoc(doc)
  {
    const output = this.marked.parse(doc.content);
    if (typeof output === S && output.trim() !== '')
    {
      doc.setContent(output);
    }
    return doc;
  }

  $textileDoc(doc)
  {
    const output = this.textile.parse(doc.content);
    if (typeof output === S && output.trim() !== '')
    {
      doc.setContent(output);
    }
    return doc;
  }

  $reTag(tag)
  {
    return new RegExp(`<${tag}>(.*?)</${tag}>`, 'gs');
  }

  async $renderAsyncTag(doc, tag, fn)
  {
    const regExp = this.$reTag(tag);
    const output = await replaceAsync(doc.content, regExp, fn);
    if (typeof output === S && output.trim() !== '')
    {
      doc.setContent(output);
    }
    return doc;
  }

  $renderSyncTag(doc, tag, fn)
  {
    const regExp = this.$reTag(tag);
    const output = doc.content.replaceAll(regExp, fn);
    if (typeof output === S && output.trim() !== '')
    {
      doc.setContent(output);
    }
    return doc;
  }

  async $twingTag(doc)
  {
    let num=0;
    const tag = this.twingTag;

    const fn = (matches, tagContent) => 
    {
      const id = doc.id+`:tag[${num++}]`;
      return this.$renderTwing(id, tagContent, doc.data);
    }

    return this.$renderAsyncTag(doc, tag, fn);
  }

  $markedTag(doc)
  {
    const tag = this.markedTag;

    const fn = (matches, tagContent) => 
    {
      return this.marked.parse(tagContent);
    }

    return this.$renderSyncTag(doc, tag, fn);
  }

  $textileTag(doc)
  {
    const tag = this.textileTag;

    const fn = (matches, tagContent) => 
    {
      return this.textile.parse(tagContent);
    }

    return this.$renderSyncTag(doc, tag, fn);
  }

} // DoxsParser class

module.exports = DoxsParser;
