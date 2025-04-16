This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# GamingStreams (GBS) - User Guide

## Introduction

GamingStreams (GBS) is an interactive platform that connects streamers with their audience through real-time polls, voting, and analytics. This guide will help you navigate the application and make the most of its features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Using Polls](#using-polls)
3. [Streamer Dashboard](#streamer-dashboard)
4. [Real-time Updates](#real-time-updates)
5. [Troubleshooting](#troubleshooting)

## Getting Started

### Account Registration

1. Visit the GBS application and click on "LOGIN" in the header.
2. On the authentication page, select "Register" to create a new account.
3. Fill in your details and select your account type (Viewer or Streamer).
4. Complete the registration process to access the platform.

### Logging In

1. Click on "LOGIN" in the header.
2. Enter your credentials to access your account.
3. After successful login, you'll be redirected to the homepage.

## Using Polls

### Viewing Active Polls

- Active polls are displayed on the homepage in the "LIVE POLLS" section.
- If you're not logged in, you'll see a prompt to sign in to participate.
- Each poll shows the question, streamer name, and options to vote.

### Voting in Polls

1. Browse through the available active polls on the homepage.
2. Click on the option you want to vote for.
3. A loading indicator will appear while your vote is being processed.
4. Once your vote is registered, you'll see live results with percentages for each option.
5. Your selected option will be highlighted with a gold gradient.

### Real-time Results

- After voting, results update in real-time as other users cast their votes.
- Each option shows the percentage of votes and a progress bar indicating its popularity.
- The total vote count is displayed at the bottom of each poll.

## Streamer Dashboard

### Accessing the Dashboard

- Streamer accounts have access to the dashboard via the "STREAMER" link in the navigation bar.
- The dashboard is only visible to users with streamer privileges.

### Dashboard Overview

The dashboard includes:

1. **Stats Cards**:

   - Total Polls: The number of polls you've created
   - Active Polls: Number of currently running polls
   - Total Votes: Cumulative votes across all your polls
   - Average Votes Per Poll: Average engagement metric

2. **Charts**:

   - Visual representation of your polls' performance
   - Bar chart showing vote distribution across recent polls

3. **Recent Polls**:
   - List of your most recent polls with their status and vote counts
   - Options to manage active polls

### Creating Polls

1. From the dashboard, click on "Create New Poll".
2. Enter your poll question.
3. Add at least two options for voting.
4. Click "Create Poll" to publish it.
5. Your poll will immediately be live and visible to users.

### Managing Polls

- **Viewing Details**: Click on a poll to see detailed analytics
- **Ending Polls**: Click "End Poll" to stop accepting new votes
- **Deleting Polls**: Remove polls that are no longer needed

## Real-time Updates

GBS uses Server-Sent Events (SSE) for real-time updates across the platform:

- **Poll Results**: Vote counts update instantly without page refreshes
- **Dashboard Analytics**: Stats and charts refresh automatically as new data comes in
- **Status Indicators**: Live status badges show when data is being updated in real-time

## Troubleshooting

### Connection Issues

If you experience connection problems:

1. Check your internet connection.
2. Try refreshing the page.
3. If poll updates stop, the system will attempt to reconnect automatically.
4. For persistent issues, log out and log back in.

### Voting Problems

If you encounter issues when voting:

1. Ensure you're logged in.
2. Check that the poll is still active.
3. Try voting on a different poll to verify your connection.
4. If problems persist, refresh the page.

---

Thank you for using GamingStreams! If you need further assistance, please contact support.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
