# lum.doxs.js

## NOTE: Inactive project

This thing had some cool ideas, but overall is way too convoluted.
So I'm shelving it for now (as well as the PHP library that inspired it.)
I may end up tearing out the core without any rendering engine plugins
and releasing it separately as a new package at some point. I'll leave the
code up in case anyone wants to use parts of it as a basis for something else,
but no further development will go into this.

## Description

A document markup format integrating multiple rendering engines into
a single component. The default set being [Twing], [Marked], and [Textile].

Inspired by my older [lum-wiki] PHP library, but meant for in-browser 
rendering instead of server-side, and abandoning all the wiki-formatting 
stuff in favour of making it more flexible instead.

It also has [DOMPurify] and FrontMatter (YAML-headers) support.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.doxs.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/doxs)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[Twing]: https://github.com/NightlyCommit/twing
[Marked]: https://github.com/markedjs/marked
[Textile]: https://github.com/borgar/textile-js
[DOMPurify]: https://github.com/cure53/DOMPurify
[lum-wiki]: https://github.com/supernovus/lum.wiki.php
