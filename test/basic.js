const Doxs = require('../lib');
const Testset = require('./tester');
const parser = new Doxs.Parser();

const tests = new Testset(module, parser,
[
  {
    content: "# Hello world\n\nThis is a _really simple_ test of the **Doxs** renderer.\n",
    expected: "<h1>Hello world</h1>\n<p>This is a <em>really simple</em> test of the <strong>Doxs</strong> renderer.</p>\n",
  },
  {
    content: 
`# Hello {{name}}

This is a {{type}} test of the **Doxs** renderer.`,
    expected: 
`<h1>Hello World</h1>
<p>This is a <em>fairly simple</em> test of the <strong>Doxs</strong> renderer.</p>
`,
    data:
    {
      name: 'World',
      type: '*fairly simple*',
    },
  },
  {
    content:
`# Hello {{name}}

<tx>
h2. A {{type}} test of the *Doxs* renderer.
</tx>
`,
    expected:
`<h1>Hello Darkness, my old friend!</h1>
<h2>A <em>slightly advanced</em> test of the <strong>Doxs</strong> renderer.</h2>`,
    data:
    {
      name: 'Darkness, my old friend!',
      type: '_slightly advanced_',
    }
  }
]);

tests.run();
