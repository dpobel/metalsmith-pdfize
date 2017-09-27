const pdfize = require('../pdfize');
const assert = require('assert');
const sinon = require('sinon');
const metalsmith = null;

describe('Metalsmith pdfize', function () {
    const files = {
        'i-want-a-pdf.html': {contents: ''},
        'another-to-pdf.html': {contents: ''},
        'random.html': {contents: ''},
        'broken-internal.html': {contents: `
            <html>
                <body>
                    <p>Broken external reference</p>
                    <img src="/do/not/exist.png">
                </body>
            </html>
        `},
    };
    const pattern = '*pdf*';
    const patterns = ['i-want-a-pdf*', 'another-to-pdf*'];

    describe('matching', function () {
        it('should create a pdf for matched documents', function (done) {
            pdfize({pattern})(files, metalsmith, function () {
                assert(files['i-want-a-pdf.html.pdf']);
                assert(files['another-to-pdf.html.pdf']);
                done();
            });
        });

        it('should support several match expression', function (done) {
            pdfize({pattern: patterns})(files, metalsmith, function () {
                assert(files['i-want-a-pdf.html.pdf']);
                assert(files['another-to-pdf.html.pdf']);
                done();
            });
        });
    });

    describe('print options', function () {
        it('should pass print options to page.pdf()');
    });

    describe('internal server', function () {
        beforeEach(function () {
            sinon.stub(console, 'warn');
        });

        afterEach(function () {
            console.warn.restore();
        });

        it('should handle missing resource in exported file', function (done) {
            pdfize({pattern: 'broken*'})(files, metalsmith, function () {
                assert(files['broken-internal.html.pdf']);
                assert(console.warn.called, 'A warning should have been generated');
                done();
            });
        });
    });
});
