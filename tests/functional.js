const metalsmith = require("metalsmith");
const pdfize = require("../pdfize");
const fs = require("fs");
const assert = require("assert");
const isPdf = require("is-pdf");
const path = require("path");

describe("Metalsmith pdfize functional tests", function () {
  const buildDir = "build/";
  const ms = metalsmith(__dirname);

  beforeEach(function (done) {
    this.timeout(5000);
    ms.clean(true);
    ms.use(
      pdfize({
        pattern: ["*pdf.html"],
        printOptions: {
          printBackground: true,
          format: "A4",
        },
      }),
    );
    ms.destination(buildDir);
    ms.build(function (error) {
      done(error);
    });
  });

  it("should produce pdfs", function () {
    const fileDir = path.join(__dirname, buildDir);

    assert(!fs.existsSync(fileDir + "random.html.pdf"));
    assert(fs.existsSync(fileDir + "random.html"));

    assert(fs.existsSync(fileDir + "another-to-pdf.html.pdf"));
    assert(isPdf(fs.readFileSync(fileDir + "another-to-pdf.html.pdf")));
    assert(fs.existsSync(fileDir + "another-to-pdf.html"));

    assert(fs.existsSync(fileDir + "i-want-a-pdf.html.pdf"));
    assert(isPdf(fs.readFileSync(fileDir + "i-want-a-pdf.html.pdf")));
    assert(fs.existsSync(fileDir + "i-want-a-pdf.html"));
  });
});
