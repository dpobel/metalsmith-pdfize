# metalsmith-pdfize

A Metalsmith plugin to export files to PDF.

Internally, it uses Chrome in headless mode with
[Puppeteer](https://www.npmjs.com/package/puppeteer) to generate a PDF version
of any file registered in Metalsmith with `print` CSS media.

[![Build Status](https://travis-ci.org/dpobel/metalsmith-pdfize.svg?branch=main)](https://travis-ci.org/dpobel/metalsmith-pdfize)

## Installation

Because of Puppeteer, this plugin requires at least Node v6.4.0.

```
$ npm install metalsmith-pdfize
```

## Usage

### JavaScript

```js
const metalsmith = require('metalsmith');
const pdfize = require('pdfize');

metalsmith.use(pdfize({
    pattern: ['page/cv/*', 'another/page/*html'],
    printOptions: {
        printBackground: true,
        format: 'A4',
    },
});
```

The `pdfize` function accepts an option object with 2 entries:

1. `pattern`: a [multimatch](https://www.npmjs.com/package/multimatch)
   pattern(s) matching files that should be loaded and exported to PDF
1. `printOptions`: an object that is directly passed to puppeteer `Page#pdf()`
   function to control headless Chrome behaviour. See [Puppeteer
   documentation](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions)
   for available options.

PDF files are registered into Metalsmith files list. Generated PDF files are
named after the file used as source with the `.pdf` suffix. For instance, if a
pattern matches the file `page/cv/index.html`, the generated PDF path will be
`page/cv/index.html.pdf`. `metalsmith-pdfize` [does not support file
renaming](https://github.com/dpobel/metalsmith-pdfize/issues/4),
[metalsmith-renamer](https://www.npmjs.com/package/metalsmith-renamer) can be
used if you need to rename generated PDF.

### CLI

```json
{
    "plugin": {
        "metalsmith-pdfize": {
            "pattern": ["page/cv/*", "another/page/*html"],
            "printOptions": {
                "printBackground": true,
                "format": "A4"
            }
        }
    }
}
```

## License

MIT
