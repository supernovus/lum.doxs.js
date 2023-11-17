"use strict";

const core = require('@lumjs/core');
const {S,isObj} = core.types;

class DoxsDocument
{
  constructor(parser, content, data)
  {
    this.parser = parser;
    this.content = content.toString().trim();
    this.data = isObj(data) ? Object.assign({}, data) : {};
    this.contentHistory = [];
  }

  setContent(content)
  {
    if (typeof content === S && content !== this.content)
    {
      this.contentHistory.push(this.content);
      this.content = content;
      return true;
    }
    return false;
  }

  setData(...args)
  {
    while (args.length > 0)
    {
      const arg1 = args.shift();
      if (isObj(arg1))
      {
        Object.assign(this.data, arg1);
      }
      else if (typeof arg1 === S)
      {
        const arg2 = args.shift();
        this.data[arg1] = arg2;
      }
    }
  }

  delData(...keys)
  {
    for (const key of keys)
    {
      delete this.data[key];
    }
  }

  get id()
  {
    let id;
    if (this.$id)
    {
      id = this.$id;
    }
    else if (this.data.id)
    {
      id = this.data.id;
    }
    else if (this.data._id)
    {
      id = this.data._id;
    }
    else
    { // No id found. Let's generate one.
      id = Date.now().toString() + Math.random().toString().substring(1);
      this.$id = id;
      return id;
    }

    if (typeof id === S)
    { // Easiest.
      return id;
    }
    else if (isObj(id) && typeof id.$oid === S)
    { // MongoDB's ObjectId format.
      return id.$oid;
    }
    else 
    { // Something else? Make a string out of it.
      id = JSON.stringify(id).replace(/\W+/g, '_');
      this.$id = id;
      return id;
    }
  }

  parse()
  {
    return this.parser.parse(this);
  }

} // DoxsDocument class

module.exports = DoxsDocument;
