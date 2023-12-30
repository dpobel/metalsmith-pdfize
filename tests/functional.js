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

  const build = async ({
    pattern,
    printOptions = undefined,
    launchOptions = undefined,
  }) => {
    const ms = metalsmith(__dirname);
    ms.clean(true);
    ms.use(
      pdfize({
        pattern,
        printOptions,
        launchOptions,
      }),
    );
    ms.destination(buildDir);
    await ms.build();
  };

  describe("matching", () => {
    it("should create a pdf for matched documents", async function () {
      await build({ pattern: "*pdf.html" });
      assert(!fs.existsSync(fileDir + "random.html.pdf"));
      assert(fs.existsSync(fileDir + "random.html"));

      assert(fs.existsSync(fileDir + "another-to-pdf.html.pdf"));
      assert(isPdf(fs.readFileSync(fileDir + "another-to-pdf.html.pdf")));
      assert(fs.existsSync(fileDir + "another-to-pdf.html"));

      assert(fs.existsSync(fileDir + "i-want-a-pdf.html.pdf"));
      assert(isPdf(fs.readFileSync(fileDir + "i-want-a-pdf.html.pdf")));
      assert(fs.existsSync(fileDir + "i-want-a-pdf.html"));
    });

    it("should support several match pattern", async function () {
      await build({ pattern: ["i-want-a-pdf*", "another-to-pdf*"] });
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

  describe("options", function () {
    let pdfjsLib;

    beforeEach(async function () {
      pdfjsLib = await import("pdfjs-dist");
    });

    describe("print options", () => {
      it("should take print options into account", async function () {
        await build({
          pattern: "random.html",
          printOptions: {
            height: "500px",
            width: "500px",
          },
        });
        const pdf = await pdfjsLib.getDocument(fileDir + "random.html.pdf")
          .promise;

        const page = await pdf.getPage(1);
        const { pageWidth, pageHeight } = page.getViewport().rawDims;
        assert.equal(pageWidth, pageHeight);
      });
    });

    describe("launch options", () => {
      it("should take launch options into account", async function () {
        await build({
          pattern: "random.html",
          launchOptions: {
            args: ["--user-agent=metalsmith-pdfize"],
          },
        });
        const pdf = await pdfjsLib.getDocument(fileDir + "random.html.pdf")
          .promise;

        const metadata = await pdf.getMetadata();
        assert(metadata.info.Creator, "metalsmith-pdfize");
      });
    });
  });

  describe("internal server", function () {
    beforeEach(function () {
      sinon.stub(console, "warn");
    });

    afterEach(function () {
      console.warn.restore();
    });

    it("should warn about broken external reference", async function () {
      await build({ pattern: "broken.html" });
      assert(fs.existsSync(fileDir + "broken.html.pdf"));
      assert(fs.existsSync(fileDir + "broken.html"));
      assert(console.warn.calledOnce, "A warning should have been generated");
    });
  });
});
