"use strict";

const core = require('@lumjs/core');
const {F,isObj,def} = core.types;

function makeExtensionClass(classConstructor)
{
  classConstructor.isDoxsExt = function(what)
  {
    if (typeof what === F)
    {
      return this.isPrototypeOf(what);
    }
    else if (what instanceof this)
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  const classProto = classConstructor.prototype;

  def(classProto, 'doxsOptions', 
  {
    get() 
    {
      if (isObj(this.$doxsExtOptions))
      {
        return this.$doxsExtOptions;
      }
      return this.defaultDoxsOptions;
    },
    set(value)
    {
      if (isObj(value))
      {
        this.$doxsExtOptions = value;
      }
      else
      {
        throw new TypeError("Invalid object");
      }
    },
  });

  def(classProto, 'doxsExtName',
  {
    get() { return this.constructor.name; }
  });

  return classConstructor;
}

module.exports =
{
  makeExtensionClass,
}
