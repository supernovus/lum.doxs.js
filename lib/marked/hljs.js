"use strict";

const {markedHighlight} = require('marked-highlight');
const hljs = require('highlight.js');

const Extension = require('./extension');

class DoxsMarkedHljs extends Extension
{
  get handler()
  {
    return markedHighlight(this.doxsOptions);
  }

  get defaultDoxsOptions()
  {
    return(
    {
      langPrefix: 'hljs language-',
      highlight(code, lang)
      {
        //console.debug("hljs:highlight()", {hljs, code, lang});
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, {language}).value;
      }
    });
  }
}

module.exports = DoxsMarkedHljs;
