"use strict";

const core = require('@lumjs/core');
const {N} = core.types;

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
    const frontMatter = getFrontMatter(parser, options.frontMatter, false);
    libs.unshift(frontMatter);
  }

  if (options.domPurify)
  {
    const domPurify = getDOMPurify(parser, options.domPurify, false);
    libs.push(domPurify);
  }

  return libs;
}

function getFrontMatter(parser, options, useAt=0)
{
  const FrontMatter = require('./engines/frontmatter');
  const frontMatter = new FrontMatter(parser, options);

  if (typeof useAt === N)
  {
    parser.at(useAt).use(frontMatter);
  }

  return frontMatter;
}

function getDOMPurify(parser, options, useAt=-1)
{
  const DOMPurify = require('./engines/dompurify');
  const domPurify = new DOMPurify(parser, options);

  if (typeof useAt === N)
  {
    parser.at(useAt).use(domPurify);
  }

  return domPurify;
}

module.exports = 
{
  loadDefaults, getFrontMatter, getDOMPurify,
}
