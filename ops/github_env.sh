#!/bin/bash

echo "GITHUB_WORKFLOW=$GITHUB_WORKFLOW" #	The name of the workflow.
echo "GITHUB_RUN_ID=$GITHUB_RUN_ID" #	A unique number for each run within a repository. This number does not change if you re-run the workflow run.
echo "GITHUB_RUN_NUMBER=$GITHUB_RUN_NUMBER" #	A unique number for each run of a particular workflow in a repository. This number begins at 1 for the workflow's first run, and increments with each new run. This number does not change if you re-run the workflow run.
echo "GITHUB_JOB=$GITHUB_JOB" #	The job_id of the current job.
echo "GITHUB_ACTION=$GITHUB_ACTION" #	The unique identifier (id) of the action.
echo "GITHUB_ACTIONS=$GITHUB_ACTIONS" #	Always set to true when GitHub Actions is running the workflow. You can use this variable to differentiate when tests are being run locally or by GitHub Actions.
echo "GITHUB_ACTOR=$GITHUB_ACTOR" #	The name of the person or app that initiated the workflow. For example, octocat.
echo "GITHUB_REPOSITORY=$GITHUB_REPOSITORY" #	The owner and repository name. For example, octocat/Hello-World.
echo "GITHUB_EVENT_NAME=$GITHUB_EVENT_NAME" #	The name of the webhook event that triggered the workflow.
echo "GITHUB_EVENT_PATH=$GITHUB_EVENT_PATH" #	The path of the file with the complete webhook event payload. For example, /github/workflow/event.json.
echo "GITHUB_WORKSPACE=$GITHUB_WORKSPACE" #	The GitHub workspace directory path. The workspace directory is a copy of your repository if your workflow uses the actions/checkout action. If you don't use the actions/checkout action, the directory will be empty. For example, /home/runner/work/my-repo-name/my-repo-name.
echo "GITHUB_SHA=$GITHUB_SHA" #	The commit SHA that triggered the workflow. For example, ffac537e6cbbf934b08745a378932722df287a53.
echo "GITHUB_REF=$GITHUB_REF" #	The branch or tag ref that triggered the workflow. For example, refs/heads/feature-branch-1. If neither a branch or tag is available for the event type, the variable will not exist.
