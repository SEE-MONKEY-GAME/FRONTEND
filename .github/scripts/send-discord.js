import fs from 'fs';
import yaml from 'js-yaml';
import fetch from 'node-fetch';

const eventPath = process.env.GITHUB_EVENT_PATH;
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

const reviewersConfig = yaml.load(fs.readFileSync('.github/config/reviewers.yml', 'utf8'));

const webhook = process.env.DISCORD_WEBHOOK;

let message = '';

if (event.pull_request) {
  const pr = event.pull_request;
  const actor = event.sender.login;

  if (event.action === 'opened') {
    let mentions = '';
    if (pr.requested_reviewers) {
      mentions = pr.requested_reviewers
        .map((r) => reviewersConfig[r.login])
        .filter(Boolean)
        .map((id) => `<@${id}>`)
        .join(' ');
    }

    message = `📢 PR #${pr.number}이 ${actor}님에 의해 열렸어요!
👉 [**${pr.title}**](${pr.html_url})
${mentions ? mentions + '님, 리뷰 부탁드려요!' : ''}`;
  }

  if (pr.merged) {
    message = `🚀 PR #${pr.number} **${pr.title}**가 머지되었어요!`;
  }
}

if (event.review) {
  if (event.review.state === 'approved') {
    const reviewer = event.review.user.login;
    message = `✅ PR #${event.pull_request.number} **${event.pull_request.title}**가 ${reviewer}님에 의해 승인되었어요!`;
  }

  if (event.review.body) {
    const reviewer = event.review.user.login;
    const body = event.review.body;
    message = `💬 PR #${event.pull_request.number} **${event.pull_request.title}**에 ${reviewer}님이 리뷰를 남겼어요!
> ${body}
👉 [PR 바로가기](${event.pull_request.html_url})`;
  }
}

if (event.comment) {
  const commenter = event.comment.user.login;
  const body = event.comment.body;
  const prNumber = event.issue?.number;
  const prTitle = event.issue?.title;
  const prUrl = event.issue?.html_url;

  message = `💬 PR #${prNumber} **${prTitle}**에 ${commenter}님이 코멘트를 남겼어요!
> ${body}
👉 [PR 바로가기](${prUrl})`;
}

if (message && webhook) {
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });
}
