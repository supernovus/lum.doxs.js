"use strict";

const textile = require('textile-js');
const Engine  = require('./engine');

class TextileEngine extends Engine
{
  handleDoc(doc)
  {
    return textile.parse(doc.content, this.options);
  }

  getTagHandler()
  {
    return (_, tagContent) => 
    {
      return textile.parse(tagContent, this.options);
    }
  }

}

module.exports = TextileEngine;
