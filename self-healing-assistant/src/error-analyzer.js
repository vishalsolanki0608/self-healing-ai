const fs = require("fs");

class ErrorAnalyzer {
  analyze(errorLog) {
    if (!errorLog || !errorLog.stack) {
      throw new Error("Error log does not contain a stack trace");
    }

    const stackLines = errorLog.stack.split("\n");

    const sourceLocation = this.findSourceLocation(stackLines);

    if (!sourceLocation) {
      throw new Error("Could not identify source file from stack trace");
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

  findSourceLocation(stackLines) {
    for (const line of stackLines) {
      const match = line.match(/\((.*):(\d+):(\d+)\)/);

      if (!match) {
        continue;
      }

      const file = match[1];
      const lineNumber = Number(match[2]);
      const columnNumber = Number(match[3]);

      if (!fs.existsSync(file)) {
        continue;
      }

      return {
        file,
        line: lineNumber,
        column: columnNumber,
      };
    }

    return null;
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
