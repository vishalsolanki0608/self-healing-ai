const { Octokit } = require("@octokit/rest");

class GitHubManager {
  constructor() {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not configured");
    }

    if (!process.env.GITHUB_OWNER) {
      throw new Error("GITHUB_OWNER is not configured");
    }

    if (!process.env.GITHUB_REPO) {
      throw new Error("GITHUB_REPO is not configured");
    }

    this.owner = process.env.GITHUB_OWNER;

    this.repo = process.env.GITHUB_REPO;

    this.baseBranch = process.env.GITHUB_BASE_BRANCH || "main";

    this.client = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async createPullRequest(branchName, title, body) {
    console.log("\n🔗 Creating GitHub Pull Request...");

    try {
      const response = await this.client.rest.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        head: branchName,
        base: this.baseBranch,
        body,
      });

      console.log("\n🎉 Pull Request created successfully!");

      console.log(`🔗 ${response.data.html_url}`);

      return {
        number: response.data.number,

        url: response.data.html_url,

        title: response.data.title,
      };
    } catch (error) {
      throw new Error(`Failed to create GitHub PR: ${error.message}`);
    }
  }
}

module.exports = GitHubManager;
