# metalsmith-pdfize

A Metalsmith plugin to export files to PDF.

Internally, it uses Chrome in headless mode with
[Puppeteer](https://www.npmjs.com/package/puppeteer) to generate a PDF version
of any file registered in Metalsmith with `print` CSS media.

![Build status](https://github.com/dpobel/metalsmith-pdfize/actions/workflows/main.yml/badge.svg)

## Installation

This plugin requires Node.js 18 or later

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
    launchOptions: {},
});
```

The `pdfize` function accepts an option object with 3 entries:

1. `pattern`: a [multimatch](https://www.npmjs.com/package/multimatch)
   pattern(s) matching files that should be loaded and exported to PDF
2. `printOptions`: an object that is directly passed to puppeteer `Page#pdf()`
   function to control headless Chrome behaviour. See [Puppeteer
   documentation](https://pptr.dev/api/puppeteer.pdfoptions)
   for available options.
3. `launchOptions` an object that is passed to puppeteer `Puppeteer#launch()`
   function to control headless Chrome behaviour. See [Puppeteer
   documentation](https://pptr.dev/api/puppeteer.browserlaunchargumentoptions)
   for available options. The `headless` is set by default to `new` but it can be overridden if needed.

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
