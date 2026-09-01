require("dotenv").config();

const LogMonitor = require("./log-monitor");
const ErrorAnalyzer = require("./error-analyzer");
const AIFixer = require("./ai-fixer");
const CodePatcher = require("./code-patcher");
const CodeValidator = require("./code-validator");
const GitManager = require("./git-manager");

const errorAnalyzer = new ErrorAnalyzer();
const aiFixer = new AIFixer();
const codePatcher = new CodePatcher();
const codeValidator = new CodeValidator();
const gitManager = new GitManager();

let isProcessing = false;

async function handleError(errorLog) {
  if (isProcessing) {
    console.log("⏳ Another self-healing operation is already running.");

    return;
  }

  isProcessing = true;

  console.log("\n🚨 ERROR DETECTED!");

  try {
    // --------------------------------
    // STEP 1: Analyze error
    // --------------------------------

    const analysis = errorAnalyzer.analyze(errorLog);

    console.log("\n========== ERROR ANALYSIS ==========");

    console.log("Error:", analysis.error);

    console.log("Source File:", analysis.source.file);

    console.log("Error Line:", analysis.source.line);

    console.log("\nRelevant Code:");

    console.log(analysis.source.code);

    console.log("\n====================================");

    // --------------------------------
    // STEP 2: Generate AI fix
    // --------------------------------

    const aiFix = await aiFixer.generateFix(analysis);

    console.log("\n========== AI FIX ==========");

    console.log(JSON.stringify(aiFix, null, 2));

    console.log("============================");

    // --------------------------------
    // STEP 3: Create healing branch
    // --------------------------------

    const branchName = await gitManager.createBranch();

    console.log(`🌿 Working on branch: ${branchName}`);

    // --------------------------------
    // STEP 4: Apply patch
    // --------------------------------

    const patchResult = codePatcher.applyPatch(aiFix);

    console.log("\n🛠️ Patch applied:");

    console.log(`File: ${patchResult.file}`);

    console.log(`Old Code:\n${patchResult.oldCode}`);

    console.log(`New Code:\n${patchResult.newCode}`);

    // --------------------------------
    // STEP 5: Validate
    // --------------------------------

    await codeValidator.validate(patchResult.file);

    console.log("\n✅ Code validation successful.");

    // --------------------------------
    // STEP 6: Check Git diff
    // --------------------------------

    const diff = await gitManager.getDiff();

    if (!diff) {
      throw new Error("No Git diff detected after patch");
    }

    console.log("\n========== GIT DIFF ==========");

    console.log(diff);

    console.log("==============================");

    // --------------------------------
    // STEP 7: Commit
    // --------------------------------

    await gitManager.commit("fix: automatically repair detected runtime error");

    // --------------------------------
    // STEP 8: Push
    // --------------------------------

    await gitManager.push(branchName);

    console.log("\n🎉 Self-healing Git workflow completed.");
  } catch (error) {
    console.error("\n❌ Self-healing workflow failed:");

    console.error(error.message);
  } finally {
    isProcessing = false;
  }
}

const monitor = new LogMonitor(handleError);

monitor.start();
