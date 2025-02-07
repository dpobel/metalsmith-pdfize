const metalsmith = require("metalsmith");
const pdfize = require("../pdfize");
const fs = require("fs");
const assert = require("assert");
const isPdf = require("is-pdf");
const path = require("path");
const sinon = require("sinon");

describe("Metalsmith pdfize functional tests", function () {
  const buildDir = "build/";
  const fileDir = path.join(__dirname, buildDir);

  before(async () => {
    sinon.stub(console, "warn");

    if (!Promise.withResolver) {
      // https://stackoverflow.com/a/78710614
      Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      };
    }

    !fs.existsSync(fileDir) && fs.mkdirSync(fileDir);
    const ms = metalsmith(__dirname);
    ms.clean(true);
    ms.use(
      pdfize({
        pattern: "*pdf.html",
        launchOptions: {
          args: ["--no-sandbox"],
        },
      }),
    );
    ms.use(
      pdfize({
        pattern: ["random.html", "pdf*", "broken.html"],
        printOptions: {
          height: "500px",
          width: "500px",
        },
        launchOptions: {
          args: ["--user-agent=metalsmith-pdfize", "--no-sandbox"],
        },
      }),
    );
    ms.destination(buildDir);
    await ms.build();
  });

  after(async () => {
    console.warn.restore();
  });

  describe("matching", () => {
    it("should create a pdf for matched documents", async function () {
      assert(fs.existsSync(fileDir + "another-to-pdf.html.pdf"));
      assert(isPdf(fs.readFileSync(fileDir + "another-to-pdf.html.pdf")));
      assert(fs.existsSync(fileDir + "another-to-pdf.html"));

      assert(fs.existsSync(fileDir + "i-want-a-pdf.html.pdf"));
      assert(isPdf(fs.readFileSync(fileDir + "i-want-a-pdf.html.pdf")));
      assert(fs.existsSync(fileDir + "i-want-a-pdf.html"));

      assert(!fs.existsSync(fileDir + "left-alone.html.pdf"));
      assert(fs.existsSync(fileDir + "left-alone.html"));
    });

    it("should support several match pattern", async function () {
      assert(fs.existsSync(fileDir + "random.html.pdf"));
      assert(isPdf(fs.readFileSync(fileDir + "random.html.pdf")));
      assert(fs.existsSync(fileDir + "random.html"));

      assert(fs.existsSync(fileDir + "pdf-i-want.html.pdf"));
      assert(isPdf(fs.readFileSync(fileDir + "pdf-i-want.html.pdf")));
      assert(fs.existsSync(fileDir + "pdf-i-want.html"));
    });
  });

  describe("options", function () {
    let pdfjsLib;

    beforeEach(async function () {
      pdfjsLib = await import("pdfjs-dist");
    });

    describe("print options", () => {
      it("should take print options into account", async function () {
        const pdf = await pdfjsLib.getDocument(fileDir + "random.html.pdf")
          .promise;

        const page = await pdf.getPage(1);
        const { pageWidth, pageHeight } = page.getViewport().rawDims;
        assert.equal(pageWidth, pageHeight);
      });
    });

    describe("launch options", () => {
      it("should take launch options into account", async function () {
        const pdf = await pdfjsLib.getDocument(fileDir + "random.html.pdf")
          .promise;

        const metadata = await pdf.getMetadata();
        assert(metadata.info.Creator, "metalsmith-pdfize");
      });
    });
  });

  describe("internal server", function () {
    it("should warn about broken external reference", async function () {
      assert(fs.existsSync(fileDir + "broken.html.pdf"));
      assert(fs.existsSync(fileDir + "broken.html"));
      assert(console.warn.calledOnce, "A warning should have been generated");
    });
  });
});
