const fs = require("fs");
const path = require("path");

class ErrorAnalyzer {
  analyze(errorLog) {
    if (!errorLog || !errorLog.stack) {
      throw new Error("Error log does not contain a stack trace");
    }

    const stackLines = errorLog.stack.split("\n");

    const sourceLocation = this.findApplicationSourceLocation(stackLines);

    if (!sourceLocation) {
      throw new Error(
        "Could not identify application source file from stack trace",
      );
    }

    const sourceCode = this.readSourceFile(
      sourceLocation.file,
      sourceLocation.line,
    );

    return {
      error: {
        name: this.extractErrorName(errorLog.error),
        message: errorLog.error,
      },

      request: {
        path: errorLog.path,
        method: errorLog.method,
      },

      source: {
        file: sourceLocation.file,
        line: sourceLocation.line,
        column: sourceLocation.column,
        code: sourceCode,
      },

      stack: errorLog.stack,
    };
  }

  findApplicationSourceLocation(stackLines) {
    const applicationFrames = [];

    for (const line of stackLines) {
      const match = line.match(/^\s*at\s+(?:.*\s)?\(?(.+):(\d+):(\d+)\)?\s*$/);

      if (!match) {
        continue;
      }

      const filePath = path.resolve(match[1].trim());

      const lineNumber = Number(match[2]);

      const columnNumber = Number(match[3]);

      // Ignore dependencies.
      if (filePath.includes(`${path.sep}node_modules${path.sep}`)) {
        continue;
      }

      // Only allow demo-backend application source.
      if (
        !filePath.includes(`${path.sep}demo-backend${path.sep}src${path.sep}`)
      ) {
        continue;
      }

      if (!fs.existsSync(filePath)) {
        continue;
      }

      applicationFrames.push({
        file: filePath,
        line: lineNumber,
        column: columnNumber,
      });
    }

    if (applicationFrames.length === 0) {
      return null;
    }

    // The first application frame is normally
    // the actual location where the error occurred.
    return applicationFrames[0];
  }

  readSourceFile(filePath, errorLine) {
    const source = fs.readFileSync(filePath, "utf8");

    const lines = source.split("\n");

    const startLine = Math.max(1, errorLine - 3);

    const endLine = Math.min(lines.length, errorLine + 3);

    const relevantLines = [];

    for (let i = startLine; i <= endLine; i++) {
      relevantLines.push(`${i}: ${lines[i - 1]}`);
    }

    return relevantLines.join("\n");
  }

  extractErrorName(errorMessage) {
    if (!errorMessage) {
      return "UnknownError";
    }

    if (errorMessage.includes("Cannot read properties")) {
      return "TypeError";
    }

    if (errorMessage.includes("undefined")) {
      return "TypeError";
    }

    return "Error";
  }
}

module.exports = ErrorAnalyzer;
