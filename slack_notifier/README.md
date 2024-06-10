# Slack notifier
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Slack-a?style=flat&logo=slack&label=App&color=4A154B&logoColor=ffffff)](https://slack.com/)

This is a `Cloud Function` that is triggered by a `Pub/Sub` message.
When a log message is above or equal to an error in severity, a `Log Router Sink` publishes a message to the topic connected to this `Cloud Function`.

The purpose of this function is to notify everyone connected to the project on [Slack](https://slack.com/). The message will include (most of the time) a link to the error message with a correct query to find the error in the `Logs Explorer`.
