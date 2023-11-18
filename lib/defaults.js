"use strict";

//const core = require('@lumjs/core');

function loadDefaults(parser, options={})
{
  const libs =
  [
    // Core engines.
    require('./engines/twing'),
    require('./engines/textile').new(parser, {tagName: 'tx'}),
    require('./engines/marked'),

    // Marked plugins.
    require('./marked/directives'),
    require('./marked/hljs'),

    // Twing plugins.
    require('./twing/switch'),
  ];

  if (options.frontMatter)
  {
    const FrontMatter = require('./engines/frontmatter');
    const frontMatter = new FrontMatter(parser, options.frontMatter);
    libs.unshift(frontMatter);
  }

  if (options.domPurify)
  {
    const DOMPurify = require('./engines/dompurify');
    const domPurify = new DOMPurify(parser, options.domPurify);
    libs.push(domPurify);
  }

  return libs;
}

module.exports = loadDefaults;
