const http = require('http');
const puppeteer = require('puppeteer');
const multimatch = require('multimatch');
const async = require('async');

function pdfize(serverInfo, browser, printOptions, files, path, callback) {
    const pdfPath = path + '.pdf'; // TODO not super nice

    browser.newPage()
        .then((page) => page.goto(`http://${serverInfo.address}:${serverInfo.port}/${path}`, {waitUntil: 'networkidle'})
            .then(() => page.pdf(printOptions))
            .catch(callback)
        )
        .then((buffer) => {
            files[pdfPath] = {
                path: pdfPath,
                contents: buffer,
            };
            callback();
        })
        .catch(callback);
}

function serveMetalsmithFiles(files) {
    return function (req, res) {
        const localPath = req.url.replace(/^\/+/, '');

        if ( !files[localPath] ) {
            console.warn(`[metalsmith-pdfize] Unable to serve "${req.url}" from file list`);
            res.writeHead(404);
            return res.end();
        }
        res.writeHead(200);
        res.end(files[localPath].contents);
    };
}

module.exports = function (options) {
    return function (files, metalsmith, done) {
        const server = http.createServer(serveMetalsmithFiles(files));
        const toExport = multimatch(Object.keys(files), options.pattern);

        server.listen(0, '127.0.0.1', () => {
            puppeteer.launch().then((browser) => {
                const pdfizeFn = pdfize.bind(null, server.address(), browser, options.printOptions, files);

                async.each(toExport, pdfizeFn, (err) => {
                    server.close();
                    browser.close().then(() => {
                        done(err);
                    });
                });
            });
        });
    };
};


