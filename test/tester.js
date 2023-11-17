"use strict";

const core = require('@lumjs/core');
const {F} = core.types;
const Test = require('@lumjs/tests');

class Tester
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
    test.doc = this.parser.load(test.content, test.data);
    this.hook('postBuild', test);
    return this;
  }
  
  async render(test)
  {
    this.hook('preRender', test);
    test.output = await this.parser.parse(test.doc);
    this.hook('postRender', test);
    return test;
  }
  
  validate(test)
  {
    this.$test.is(test.output, test.expected, test.name);
    if (++this.ran === this.plan)
    {
      this.$test.done();
    }
  }
  
  test(test)
  {
    this.build(test).render(test).then(test => this.validate(test));
  }

  run()
  {
    for (const test of this.tests)
    {
      // Make a way for the tests to change parser settings on the fly.
      this.test(test);
    }
  }
} // Tester class

module.exports = Tester;
