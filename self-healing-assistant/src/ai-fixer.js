const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIFixer {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    this.model = this.client.getGenerativeModel({
      model: "gemini-3.6-flash",
    });
  }

  async generateFix(analysis) {
    const prompt = this.buildPrompt(analysis);

    console.log("\n🤖 Sending error to Gemini...");

    const result = await this.model.generateContent(prompt);

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return this.parseResponse(text);
  }

  parseResponse(text) {
    try {
      // Remove markdown code fences if Gemini adds them
      const cleanedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanedText);

      this.validateResponse(parsed);

      return parsed;
    } catch (error) {
      throw new Error(`Invalid AI response: ${error.message}`);
    }
  }

  validateResponse(response) {
    const requiredFields = [
      "cause",
      "file",
      "line",
      "oldCode",
      "newCode",
      "reason",
    ];

    for (const field of requiredFields) {
      if (
        response[field] === undefined ||
        response[field] === null ||
        response[field] === ""
      ) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Number.isInteger(response.line)) {
      throw new Error("AI response 'line' must be an integer");
    }

    if (
      typeof response.oldCode !== "string" ||
      typeof response.newCode !== "string"
    ) {
      throw new Error("oldCode and newCode must be strings");
    }
  }

  buildPrompt(analysis) {
    return `
You are an expert Node.js backend developer.

A backend application has encountered a runtime error.

Your task is to identify the smallest safe code change
that fixes the error.

IMPORTANT RULES:

1. Do not rewrite the entire file.
2. Do not change unrelated code.
3. Make the smallest possible fix.
4. Preserve existing application behavior.
5. Identify the exact source file.
6. Identify the exact line containing the problematic code.
7. Return the exact existing code that should be replaced.
8. Return the exact replacement code.
9. Do not include markdown.
10. Do not include explanations outside the JSON.
11. Return ONLY valid JSON.

The JSON must have EXACTLY this structure:

{
  "cause": "string",
  "file": "absolute file path",
  "line": 25,
  "oldCode": "exact existing code",
  "newCode": "replacement code",
  "reason": "string"
}

IMPORTANT:

- "oldCode" must exactly match code from the provided source.
- "newCode" must contain only the replacement code.
- Do not add markdown code fences.
- Do not modify dependencies.
- Do not create new files.
- Do not modify unrelated code.

ERROR:

${JSON.stringify(analysis.error, null, 2)}

REQUEST:

${JSON.stringify(analysis.request, null, 2)}

SOURCE FILE:

${analysis.source.file}

ERROR LINE:

${analysis.source.line}

RELEVANT SOURCE CODE:

${analysis.source.code}

STACK TRACE:

${analysis.stack}
`;
  }
}

module.exports = AIFixer;
