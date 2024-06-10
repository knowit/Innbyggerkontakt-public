"""Slack notifier."""
import json
import os
from datetime import timedelta

import requests

from models import PubsubEvent


def slack_notifier(event, context):
    """Post Slack notifications by web hooks."""
    log_url = (
        'https://console.cloud.google.com/logs/query;query=labels.{execution_id_type}%3D%22'
        '{execution_id}%22;timeRange={error_date}T00:00:00.000Z%2F{date_day_after}T00:00:00.000Z?project={project_id}'
    )
    data = PubsubEvent(**event)
    error_date = data.data.timestamp.strftime('%Y-%m-%d')
    day_after_error = (data.data.timestamp + timedelta(days=1)).strftime('%Y-%m-%d')
    execution_id_type = ''
    execution_id = ''
    if data.data.resource.type == 'cloud_function':
        execution_id_type = 'execution_id'
        execution_id = data.data.labels.get('execution_id', '')
    elif data.data.resource.type == 'cloud_run_revision':
        execution_id_type = 'instanceId'
        execution_id = data.data.labels.get('instanceId', '')

    formatted_log_url = log_url.format(
        execution_id_type=execution_id_type,
        execution_id=execution_id,
        error_date=error_date,
        date_day_after=day_after_error,
        project_id=data.data.resource.labels.get('project_id'),
    )

    message = {
        'attachments': [
            {
                'fallback': 'ERROR, ' + formatted_log_url,
                'color': '#ff0000',
                'pretext': 'ERROR!!! :aaahhh:',
                'title': ' '.join(
                    [value for key, value in data.data.resource.labels.items()]
                ),
                'title_link': formatted_log_url,
                'text': data.data.text_payload,
                'ts': data.data.timestamp.timestamp(),
            }
        ]
    }
    requests.post(
        os.getenv('SLACK_WEBHOOK_URL'),
        headers={'Content-type': 'application/json'},
        data=json.dumps(message),
    )
