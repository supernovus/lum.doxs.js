"use strict";

const {isObj} = require('@lumjs/core/types');
const Doxs = require('../../lib');
const TestRunner = require('../inc/testrunner');

const DoxsTestDef =
{
  libs: {Doxs, TestRunner},

  parser()
  {
    return new Doxs.Parser(...arguments);
  },

  setup(defs)
  {
    defs.$init = this;
    defs._libs = this.libs;
  
    defs.testsetFor = function(mod)
    {
      return new TestRunner(mod, this.parser, this.tests);
    }
  
    defs.run = function(mod)
    {
      this.testsetFor(mod).run();
    }

    if (defs.parser === undefined)
    {
      if (isObj(defs.parsers) && defs.parsers.default instanceof Doxs.Parser)
      { // A default was found.
        defs.parser = defs.parsers.default;
      }
      else
      { // Use a truly default parser.
        defs.parser = this.parser();
      }
    }

    return defs;
  },

} // Init

module.exports = DoxsTestDef;
