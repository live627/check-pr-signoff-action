# GitHub Action: Check PR commits signed off

Checks for a sign-off in every commit in a pull request and adds a comment if a commit was detected without one.

## Inputs

| **Input**        | **Description**                                                            |      **Default**      | **Required** |
| :--------------- | :------------------------------------------------------------------------- | :-------------------: | :----------: |
| **`token`**      | GitHub token for commenting on PRs, defaults to using secrets.GITHUB_TOKEN | `${{ github.token }}` |  **false**   |

## Outputs

None

## Requirements

This action must be triggered from a pull request event: `on: [pull_request]`. You can also use any `pull_request` activity type. For information on those activity types, see the [GitHub documentation](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#pull-request-event-pull_request).

## Example Usage

```yaml
name: Find signed commits

on:
  pull_request_target:

jobs:
  check-sign-off:
    name: Write comment if unsigned commits found
    env:
      FORCE_COLOR: 1
    runs-on: ubuntu-latest

    steps:
      - uses: live627/check-pr-signoff-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```