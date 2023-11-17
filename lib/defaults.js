"use strict";

const core = require('@lumjs/core');
const {lazy} = core;

const T = '$twingDoc';
const M = '$markedDoc';
const X = '$textileDoc';

const t = '$twingTag';
const m = '$markedTag';
const x = '$textileTag';

module.exports =
{
  /**
   * Parsers:
   * 
   * T = Twig (via 'twing')
   * M = Markdown (via 'marked')
   * X = Textile (via 'textile-js')
   * 
   * Use lowercase variants to look for XML-style blocks.
   * For example, if using 'x' it would look for:
   * 
   * ```
   * <tx>
   * content here
   * </tx>
   * ```
   * 
   */
  PARSERS: {T,M,X,t,m,x},

  /**
   * The default parse order.
   * 
   * - T
   * - x
   * - M
   * 
   */
  parseOrder: [T, x, M],

  /**
   * YAML document end markers.
   */
  yamlDocEnds: ['---','...'],

  /**
   * FrontMatter option.
   */
  frontMatter: false,

  /**
   * Default Twi(n)g tag <tw>
   */
  twingTag: 'tw',

  /**
   * Default Textile tag <tx>
   */
  textileTag: 'tx',

  /**
   * Default Marked tag <md>
   */
  markedTag: 'md',

} // module.exports

function getDefaultPlugins()
{
  const plugins =
  [
    require('./marked/directives'),
    require('./marked/hljs'),
    require('./twing/switch'),
  ];

  return plugins;
}

lazy(module.exports, 'PLUGINS', getDefaultPlugins);
