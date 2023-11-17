const Doxs = require('../lib');
const Testset = require('./tester');
const parser = new Doxs.Parser();

const testMatter =
`---
name: Alex
age: 42
friends:
- name: Marvin
  age: 61
- name: Lyssa
  age: 25
- name: Sam
  age: 42
---
`;

const offTest =
`# Hello {{ name }}
## {{ desc }}
`;

const offOutput =
`<hr>
<p>name: Alex
age: 42
friends:</p>
<ul>
<li>name: Marvin
age: 61</li>
<li>name: Lyssa
age: 25</li>
<li>name: Sam
age: 42</li>
</ul>
<hr>
<h1>Hello World</h1>
<h2>A test of Frontmatter content, with <code>frontMatter: false</code></h2>
`;

const mergedTest =
`# {{ desc }}
Hi, my name is {{ name }}, I am {{ age }}, and my friends are:
{% for friend in friends %}
- {{friend.name}}, who is {{friend.age}}
{% endfor %}`;

const yamlOutput =
`
<p>Hi, my name is Alex, I am 42, and my friends are:</p>
<ul>
<li>Marvin, who is 61</li>
<li>Lyssa, who is 25</li>
<li>Sam, who is 42</li>
</ul>
`

const mergedOutput = '<h1>A test of Frontmatter content,'
  + ' with <code>frontMatter: true</code></h1>'+yamlOutput;

const nestedTest =
`# Hello {{ name }}
## {{ desc }}

Hi, my name is {{ fm.name }}, I am {{ fm.age }}, and my friends are:
{% for friend in fm.friends %}
- {{friend.name}}, who is {{friend.age}}
{% endfor %}`;

const nestedOutput =
`<h1>Hello Darkness, my old friend</h1>
<h2>A test of Frontmatter content, with <code>frontMatter: {string}</code></h2>`+yamlOutput;

const tests = new Testset(module, parser,
[
  {
    content: testMatter+offTest,
    expected: offOutput,
    data:
    {
      name: 'World',
      desc: 'A test of Frontmatter content, with `frontMatter: false`',
    },
  },
  {
    preBuild(test)
    {
      test.parser.frontMatter = true;
    },
    content: testMatter+mergedTest,
    expected: mergedOutput,
    data: 
    {
      name: 'This will be overridden',
      desc: 'A test of Frontmatter content, with `frontMatter: true`',
    },
  },
  {
    preBuild(test)
    {
      test.parser.frontMatter = 'fm';
    },
    content: testMatter+nestedTest,
    expected: nestedOutput,
    data: 
    {
      name: 'Darkness, my old friend',
      desc: 'A test of Frontmatter content, with `frontMatter: {string}`',
    },
  },
]);

tests.run();
