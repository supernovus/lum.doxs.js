"use strict";

const DOMPurify = require('isomorphic-dompurify');
const Engine  = require('./engine');

class DOMPurifyEngine extends Engine
{
  handleDoc(doc)
  {
    return DOMPurify.sanitize(doc.content, this.options);
  }

  getTagHandler()
  {
    throw new Error("DOMPurify does not support tag mode");
  }

}

module.exports = DOMPurifyEngine;
