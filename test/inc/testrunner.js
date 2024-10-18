"use strict";

const core = require('@lumjs/core');
const {F} = core.types;
const Test = require('@lumjs/tests/test');

class TestRunner
{
  constructor(testMod, parser, tests)
  {
    this.parser = parser;
    this.tests = tests;
    this.plan = tests.length;
    this.ran = 0;

    this.$test = Test.new(
    {
      module: testMod, 
      plan: this.plan,
    });
  }

  hook(hook, test)
  {
    if (typeof test[hook] === F)
    {
      test[hook](this, {test, hook});
    }
  }

  build(test)
  {
    this.hook('preBuild', test);
    const parser = test.parser ?? this.parser;
    test.doc = parser.load(test.content, test.data);
    this.hook('postBuild', test);
    return this;
  }
  
  async render(test)
  {
    this.hook('preRender', test);
    const parser = test.parser ?? this.parser;
    test.output = await parser.parse(test.doc);
    this.hook('postRender', test);
    return test;
  }
  
  validate(test)
  {
    this.$test.is(test.output, test.expected, test.name);
  }
  
  test(test)
  {
    this.build(test).render(test).then(test => this.validate(test));
  }

  run()
  {
    const run = this;
    this.$test.async(async function()
    {
      for (const test of run.tests)
      {
        run.test(test);
      }
    });
    this.$test.done();
  }

} // Tester class

module.exports = TestRunner;
