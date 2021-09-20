'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run()
{
	const myToken = core.getInput('token');
	const octokit = github.getOctokit(myToken);
	const context = github.context;
	const isPullRequest = context.payload.pull_request;
	if (!isPullRequest)
		throw new Error(
			'This actions only runs against pull request events. Try modifying your workflow trigger.'
		);

	const pr = await octokit.rest.pulls.get({
		...context.repo,
		pull_number: context.issue.number
	});
	const commits = await octokit.rest.pulls.listCommits({
		...context.repo,
		pull_number: context.issue.number
	});
	const footer = '#### 📝 What should I do to fix it?\nAll proposed commits should include a sign-off in their messages, ideally at the end.\n#### ❔ Why it is required\nThe Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project. Here is the full [text of the DCO](https://developercertificate.org/), reformatted for readability:\n\n> By making a contribution to this project, I certify that:\n>\n> a. The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or\n>\n> b. The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or\n>\n> c. The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.\n>\n> d. I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.\n\nContributors _sign-off_ that they adhere to these requirements by adding a `Signed-off-by` line to commit messages.\n\n```\nThis is my commit message\n\nSigned-off-by: Random Developer <randomdeveloper@example.com>\n```\n\nGit even has a `-s` command line option to append this automatically to your commit message:\n\n```\n$ git commit -s -m \'This is my commit message\'\n```';
	const commitLines = commits.data.filter(item => !/Signed-off-by: (.*) <(.*)>/i.test(item.commit.message)).map(item => item.sha);
	const header = '❌ @' + pr.data.user.login + ' the `signed-off-by` was not found in the following **' + commitLines.length + '** commits:';
	core.warning(`Found: ${commits.data.length} total commits`);
	commits.data.forEach(item => core.info(`\u001B[1;36m ${item.sha.slice(0, 6)}\u001B[21;39m: \u001B[90m${item.commit.message.split('\n', 1)[0]}`));
	if (commitLines.length > 0)
	{
		await octokit.rest.issues.createComment({
			...context.repo,
			issue_number: context.issue.number,
			body: header + '\n\n' + commits.data.filter(item => commitLines.includes(item.sha)).map(item => `- ${item.html_url}: ${item.commit.message.split('\n', 1)[0]}`).join('\n') + '\n\n' + footer
		});
		core.info('\n');
		core.error(`Found: ${commitLines.length} commits without a valid signoff`);
		commits.data.filter(item => commitLines.includes(item.sha)).forEach(item => core.info(`\u001B[1;35m ${item.sha.slice(0, 6)}\u001B[21;39m: \u001B[90m${item.commit.message.split('\n', 1)[0]}`));
	}
}

run().catch(error => core.setFailed(error));
