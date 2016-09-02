Just create this tool to make my life better. It will automatic grep trello activity, generate a daily report and post to slack channel.

## auth.json

Put your trello & slack setting at here:

```
{
  "TRELLO": {
    "TOKEN": "Trello token",
    "KEY": "Trello application key"
  },
  "SLACK": {
    "TOKEN": "slack token (must have files:write:user) scope",
    "CHANNEL": "channel you want to post the report"
  }
}
```
