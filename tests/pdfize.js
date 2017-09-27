const pdfize = require('../pdfize');
const assert = require('assert');
const metalsmith = null;

describe('Metalsmith pdfize', function () {
    const files = {
        'i-want-a-pdf.html': {contents: ''},
        'another-to-pdf.html': {contents: ''},
        'random.html': {contents: ''},
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
        it('should handle missing resource in exported file');
    });
});
