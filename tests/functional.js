const metalsmith = require('metalsmith');
const pdfize = require('../pdfize');
const fs = require('fs');
const assert = require('assert');

describe('Metalsmith pdfize functional tests', function () {
    const buildDir = 'build/';
    const ms = metalsmith(__dirname);

    beforeEach((done) => {
        ms.use(pdfize({
            pattern: ['*pdf.html'],
            printOptions: {
                printBackground: true,
                format: 'A4',
            },
        }));
        ms.destination(buildDir);
        ms.build(function (error) {
            done(error);
        });
    });

    afterEach(() => {
        ms.clean();
    })

    it('should produce pdfs', function () {
        const fileDir = __dirname + '/' + buildDir;

        assert(!fs.existsSync(fileDir + 'random.html.pdf'));
        assert(fs.existsSync(fileDir + 'random.html'));

        assert(fs.existsSync(fileDir + 'another-to-pdf.html.pdf'));
        assert(fs.existsSync(fileDir + 'another-to-pdf.html'));

        assert(fs.existsSync(fileDir + 'i-want-a-pdf.html.pdf'));
        assert(fs.existsSync(fileDir + 'i-want-a-pdf.html'));
    });
});
