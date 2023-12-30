const http = require("http");
const puppeteer = require("puppeteer");
const async = require("async");

function pdfize(serverInfo, browser, printOptions, files, path, callback) {
  const pdfPath = path + ".pdf";
  const internalUrl = `http://${serverInfo.address}:${serverInfo.port}/${path}`;

  browser
    .newPage()
    .then((page) =>
      page
        .goto(internalUrl, { waitUntil: "networkidle0" })
        .then(() => page.pdf(printOptions))
        .catch(callback),
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
    const localPath = req.url.replace(/^\/+/, "");

    if (!files[localPath]) {
      console.warn(
        `[metalsmith-pdfize] Unable to serve "${req.url}" from file list`,
      );
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
    const toExport = metalsmith.match(options.pattern);

    server.listen(0, "127.0.0.1", () => {
      puppeteer
        .launch({ headless: "new", ...options.launchOptions })
        .then((browser) => {
          const pdfizeFn = pdfize.bind(
            null,
            server.address(),
            browser,
            options.printOptions,
            files,
          );

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
