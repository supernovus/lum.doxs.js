"use strict";

/**
 * A bundle that can be included in webpack builds for running
 * the currently defined test suite inside a browser's JS console.
 */

module.exports =
{
  basic:       require('./basic'),
  frontmatter: require('./frontmatter'),
}
