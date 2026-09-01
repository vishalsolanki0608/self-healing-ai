const { execFile } = require("child_process");
const path = require("path");

class CodeValidator {
  async validate(filePath) {
    console.log("\n🔍 Validating patched code...");

    await this.validateSyntax(filePath);

    console.log("✅ Syntax validation passed.");

    return {
      valid: true,
      file: filePath,
    };
  }

  validateSyntax(filePath) {
    return new Promise((resolve, reject) => {
      const workingDirectory = path.dirname(filePath);

      const fileName = path.basename(filePath);

      execFile(
        process.execPath,
        ["--check", fileName],
        {
          cwd: workingDirectory,
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error("❌ Syntax validation failed.");

            console.error(stderr || stdout);

            reject(new Error("Patched code contains a syntax error"));

            return;
          }

          resolve();
        },
      );
    });
  }
}

module.exports = CodeValidator;
