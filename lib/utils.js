"use strict";

const core = require('@lumjs/core');
const {S,F,isObj,def} = core.types;

function composeOptions(inOpts, ...args)
{
  //console.debug("composeOptions", {inOpts, args});
  const sources = [];

  for (const arg of args)
  {
    if (arg === true)
    { // A special value indicating to use the inOpts.
      sources.push(inOpts);
      //console.debug("composeOptions:true", {sources});
    }
    else if (isObj(arg))
    { // It's an object itself.
      sources.push(arg);
      //console.debug("composeOptions:obj", {arg, sources});
    }
    else if (typeof arg === S && isObj(inOpts[arg]))
    { // It's the name of an option.
      sources.push(inOpts[arg]);
      //console.debug("composeOptions:string", {arg, sources});
    }
  }

  return Object.assign({}, ...sources);
}

function mapOf(input)
{
  if (!isObj(input))
  {
    throw new TypeError('Non-object passed to mapOf');
  }

  if (typeof input.entries === F)
  { // Short-cut for Arrays, other Maps, etc.
    return new Map(input.entries());
  }

  const map = new Map();

  if (typeof input[Symbol.iterator] === F)
  { // Using the Iterable interface.
    let i = 0;
    for (const value of input)
    {
      map.set(i++, value);
    }
  }
  else if (typeof thing.next === F)
  { // Using the Iterator interface.
    let i = 0, next;

    while ((next = input.next()) && !next.done)
    {
      map.set(i++, next.value);
    }
  }
  else
  { // A plain old object. Use enumerable properties.
    for (const key in input)
    {
      map.set(key, input[key]);
    }
  }

  return map;
}

async function replaceAsync(string, regexp, replacerFunction) 
{
  const replacements = await Promise.all(
      Array.from(string.matchAll(regexp),
          match => replacerFunction(...match)));
  let i = 0;
  return string.replace(regexp, () => replacements[i++]);
}

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
  composeOptions, mapOf, replaceAsync, makeExtensionClass,
}
