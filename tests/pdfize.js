const pdfize = require('../pdfize');
const assert = require('assert');
const sinon = require('sinon');
const puppeteer = require('puppeteer');
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

    this.timeout(4000);

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
        let Page, browser;

        // that's a bit hackish, puppeteer does not expose the Page constructor
        // so we first launch a browser and create a new page to retrieve it to
        // be able to spy `Page#pdf()`
        before(function (done) {
            puppeteer.launch()
                .then((b) => {
                    browser = b;
                    return browser.newPage();
                })
                .then((page) => {
                    Page = page.constructor;
                    done();
                });
        });

        after(function (done) {
            browser.close().then(done);
        });

        beforeEach(function () {
            sinon.spy(Page.prototype, 'pdf');
        });

        afterEach(function () {
            Page.prototype.pdf.restore();
        });

        it('should pass print options to page.pdf()', function (done) {
            const printOptions = {};

            pdfize({
                pattern: 'random.html',
                printOptions,
            })(files, metalsmith, function () {
                assert(Page.prototype.pdf.called);
                assert.strictEqual(Page.prototype.pdf.firstCall.args[0], printOptions);
                done();
            });
        });
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
