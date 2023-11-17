"use strict";

const core = require('@lumjs/core');
const {def,lazy} = core;

def(exports, 'Parser',   require('./parser'));
def(exports, 'Document', require('./document'));
def(exports, 'DEFAULTS', require('./defaults'));
def(exports, 'utils',    require('./utils'));

const marked = def(exports, 'marked', {});
const twing  = def(exports, 'twing',  {});

lazy(marked, 'directives', () => require('./marked/directives'));
lazy(marked, 'hljs',       () => require('./marked/hljs'));

lazy(twing, 'SwitchExtension', () => require('./twing/switch'));
