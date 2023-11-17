"use strict";

const 
{
  TwingTokenParser,
  TwingNode,
  TwingCompiler,
} = require('twing');

const {TokenType} = require('twig-lexer');
const {mapOf} = require('../utils');
const Extension = require('./extension');

class SwitchExtension extends Extension
{
  getTokenParsers()
  {
    return [new SwitchTokenParser()];
  }
}

class SwitchTokenParser extends TwingTokenParser
{
  getTag()
  {
    return 'switch';
  }

  parse(token)
  {
    const lnum = token.line;
    const cnum = token.column;
    const parser = this.parser;
    const stream = parser.getStream();

    const nodes =
    {
      value: parser.parseExpression(),
      cases: [],
    }

    stream.expect(TokenType.TAG_END);

    while (stream.getCurrent().type === TokenType.WHITESPACE)
    {
      // || (stream.getCurrent().type === TokenType.TEXT 
      // && stream.getCurrent().value.trim() === '')
      stream.next();
    }

    stream.expect(TokenType.TAG_START);

    let end = false;

    while (!end)
    {
      const next = stream.next();
      switch (next.value)
      {
        case 'case':
        {
          const values = [];
          while (true)
          {
            values.push(parser.parsePrimaryExpression());
            if (stream.test(TokenType.OPERATOR, 'or'))
            { // Another case value.
              stream.next();
            }
            else
            { // Done with case values.
              break;
            }
          }
          stream.expect(TokenType.TAG_END);
          const body = parser.subparse([this, this.decideIfFork]);
          const node = new TwingNode(objectToMap(
          {
            values: new TwingNode(mapOf(values)),
            body,
          }));
          nodes.cases.push(node);
          break;
        }
        case 'default':
        {
          stream.expect(TokenType.TAG_END);
          nodes.default = parser.subparse([this, this.decideIfEnd]);
          break;
        }
        case 'endswitch':
        {
          end = true;
          break;
        }
        default:
          throw new SyntaxError('Unexpected end of Twing switch statement '
            + `in template at line:${lnum}, column:${cnum}`);
      }
    }

    stream.expect(TokenType.TAG_END);
    return new SwitchNode(mapOf(nodes), [], lnum, cnum, this.getTag());
  }

  decideIfFork(token)
  {
    return token.test(TokenType.NAME, ['case', 'default', 'endswitch']);
  }

  decideIfEnd(token)
  {
    return token.test(TokenType.NAME, 'endswitch')
  }

}

class SwitchNode extends TwingNode
{
  /**
   * Compile a Switch statement node
   * 
   * @param {TwingCompiler} compiler - Twing compiler
   */
  compile(compiler)
  {
    compiler
      .write('switch (')
      .subcompile(this.getNode('value'))
      .raw(") {\n")
      .indent();

    for (const caseNode of this.getNode('cases').nodes.values)
    { 
      if (!caseNode.hasNode('body'))
      { // No body, bye bye.
        continue;
      }

      for (const valueNode of caseNode.getNode('values').nodes.values)
      {
        compiler.write('case ').subcompile(valueNode).raw(":\n");
      }

      compiler
        .write("{\n")
        .indent()
        .subcompile(caseNode.getNode('body'))
        .write("break;\n")
        .outdent()
        .write("}\n");
    }

    if (this.hasNode('default'))
    {
      compiler
        .write("default:\n")
        .write("{\n")
        .indent()
        .subcompile(this.getNode('default'))
        .outdent()
        .write("}\n");
    }

    compiler 
      .outdent()
      .write("}\n");
  }
}

SwitchExtension.TokenParser = SwitchTokenParser;
SwitchExtension.Node        = SwitchNode;

module.exports = SwitchExtension;
