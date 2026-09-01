const { execFile } = require("child_process");
const path = require("path");

class GitManager {
  constructor() {
    this.repoPath = path.resolve(__dirname, "../../");
  }

  runGit(args) {
    return new Promise((resolve, reject) => {
      execFile(
        "git",
        args,
        {
          cwd: this.repoPath,
        },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr.trim() || error.message));

            return;
          }

          resolve(stdout.trim());
        },
      );
    });
  }

  async getStatus() {
    return this.runGit(["status", "--short"]);
  }

  async createBranch() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const branchName = `auto-healing/fix-${timestamp}`;

    console.log(`\n🌿 Creating branch: ${branchName}`);

    await this.runGit(["checkout", "-b", branchName]);

    return branchName;
  }

  async getDiff() {
    return this.runGit(["diff", "--", "demo-backend/src"]);
  }

  async commit(message) {
    console.log("\n📦 Staging changes...");

    await this.runGit(["add", "demo-backend/src"]);

    console.log("💾 Creating Git commit...");

    await this.runGit(["commit", "-m", message]);

    console.log("✅ Git commit created.");
  }

  async push(branchName) {
    console.log(`\n🚀 Pushing branch: ${branchName}`);

    await this.runGit(["push", "-u", "origin", branchName]);

    console.log("✅ Branch pushed successfully.");
  }
}

module.exports = GitManager;
