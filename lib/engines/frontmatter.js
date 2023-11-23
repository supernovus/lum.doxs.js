"use strict";

const core = require('@lumjs/core');
const {S} = core.types;
const YAML = require('yaml');
const Engine  = require('./engine');

const DEFAULT_DOC_ENDS = ['---','...',''];
class FrontMatterEngine extends Engine
{
  constructor(doxsParser, options={})
  {
    super(doxsParser, options);
    const yopts = this.yamlOpts = options.yaml ?? {};
    this.docEnds = yopts.docEndMarkers ?? DEFAULT_DOC_ENDS;
  }

  // We're overriding the full parse() method for this one.
  parse(doc)
  {
    if (doc.content.substring(0, 3) === '---')
    { // It's got FrontMatter.
      const docLines = doc.content.split("\n");
      const yamlLines = [docLines.shift()];

      while (docLines.length > 0)
      {
        const line = docLines.shift();
        if (this.docEnds.includes(line))
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

      if (typeof this.tagName === S)
      { // Add the frontmatter as a nested property.
        doc.setData(this.tagName, yamlData);
      }
      else
      { // Add the frontmatter as extra doc data.
        doc.setData(yamlData);
      }
    }
  }
}

module.exports = FrontMatterEngine;
