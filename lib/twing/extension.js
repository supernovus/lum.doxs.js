"use strict";

const core = require('@lumjs/core');
const {F} = core.types;

const {TwingExtension} = require('twing');

class DoxsTwingExtension extends TwingExtension
{
  constructor(doxsParser)
  {
    super();
    this.doxs = doxsParser;
  }

  /**
   * You probably want to override this.
   * Code-minimizers will mangle the constructor name.
   */
  get name()
  {
    return this.constructor.name;
  }

  static get $$doxsTwingExtension$$() { return true; }

  static isDoxsTwing(what)
  {
    if (typeof what === F)
    {
      return what.$$doxsTwingExtension$$ ?? false;
    }
    else if (what instanceof DoxsTwingExtension)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}

module.exports = DoxsTwingExtension;
