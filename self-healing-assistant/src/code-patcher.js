const fs = require("fs");
const path = require("path");

class CodePatcher {
  applyPatch(aiFix) {
    this.validatePatch(aiFix);

    const filePath = path.resolve(aiFix.file);

    this.validateTargetPath(filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Target file does not exist: ${filePath}`);
    }

    const originalCode = fs.readFileSync(filePath, "utf8");

    const occurrences = this.countOccurrences(originalCode, aiFix.oldCode);

    if (occurrences === 0) {
      throw new Error(
        "The oldCode provided by AI was not found in the source file",
      );
    }

    if (occurrences > 1) {
      throw new Error(
        "The oldCode appears multiple times. Refusing to patch ambiguous code.",
      );
    }

    const updatedCode = originalCode.replace(aiFix.oldCode, aiFix.newCode);

    fs.writeFileSync(filePath, updatedCode, "utf8");

    console.log(`\n🛠️ Code patched successfully: ${filePath}`);

    return {
      file: filePath,
      oldCode: aiFix.oldCode,
      newCode: aiFix.newCode,
    };
  }

  validateTargetPath(filePath) {
    const allowedSourceDirectory = path.resolve(
      __dirname,
      "../../demo-backend/src",
    );

    const relativePath = path.relative(allowedSourceDirectory, filePath);

    // File is outside demo-backend/src
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(
        `Unsafe patch rejected. AI can only modify files inside demo-backend/src: ${filePath}`,
      );
    }

    // Extra protection against dependencies
    if (filePath.includes(`${path.sep}node_modules${path.sep}`)) {
      throw new Error(
        `Unsafe patch rejected. node_modules cannot be modified: ${filePath}`,
      );
    }
  }

  validatePatch(aiFix) {
    if (!aiFix) {
      throw new Error("AI fix is missing");
    }

    const requiredFields = ["file", "line", "oldCode", "newCode"];

    for (const field of requiredFields) {
      if (
        aiFix[field] === undefined ||
        aiFix[field] === null ||
        aiFix[field] === ""
      ) {
        throw new Error(`Patch validation failed: missing ${field}`);
      }
    }

    if (!Number.isInteger(aiFix.line)) {
      throw new Error("Patch validation failed: line must be an integer");
    }

    if (
      typeof aiFix.oldCode !== "string" ||
      typeof aiFix.newCode !== "string"
    ) {
      throw new Error(
        "Patch validation failed: oldCode and newCode must be strings",
      );
    }

    if (aiFix.oldCode === aiFix.newCode) {
      throw new Error(
        "Patch validation failed: oldCode and newCode are identical",
      );
    }
  }

  countOccurrences(text, searchText) {
    let count = 0;
    let countPosition = 0;

    while (true) {
      const index = text.indexOf(searchText, countPosition);

      if (index === -1) {
        break;
      }

      count++;

      countPosition = index + searchText.length;
    }

    return count;
  }
}

module.exports = CodePatcher;
