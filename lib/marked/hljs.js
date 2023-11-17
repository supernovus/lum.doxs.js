"use strict";

const {markedHighlight} = require('marked-highlight');
const hljs = require('highlight.js');
const {makeExtension} = require('./extension');

//console.debug("hljs:extension", {hljs});

module.exports = makeExtension(
{
  id: 'hljs',
  register(parser, options)
  {
    this.parser = parser;
    return markedHighlight(options);
  },
  defaults:
  {
    langPrefix: 'hljs language-',
    highlight(code, lang)
    {
      //console.debug("hljs:highlight()", {hljs, code, lang});
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    }
  },
  libs:
  {
    hljs, markedHighlight,
  },
});
