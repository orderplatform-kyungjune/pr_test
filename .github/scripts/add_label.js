const { setOutput, setFailed } = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const prNumber = github.context.payload.pull_request.number;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

    const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber
    });

    const hasDLabel = labels.some(label => label.name.startsWith('D-'));
    if (!hasDLabel) {
      await octokit.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        labels: ['D-3']
      });
      console.log('Label D-3 added.');
    } else {
      console.log('D- label already exists.');
    }

    setOutput('result', 'success');
  } catch (error) {
    setFailed(error.message);
  }
}

run();