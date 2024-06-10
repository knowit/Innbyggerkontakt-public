"""Do send requests to mailjet and log response"""
import json
import logging
import os

import requests
from innbyggerkontakt.gcp import CloudTasks
from mailjet_response_model import MailjetResponseModel, MailjetStatus


def send_request(data, headers, request_url, retry=0):
    """Send requests to mailjet and log response"""
    print(f'data {data}')
    print(f'headers {headers}')
    print(f'request_url {request_url}')
    print(f'retry {retry}')

    try:
        response = requests.post(
            'https://api.eu.mailjet.com/v3.1/send', data=data, headers=headers
        )

        if response.status_code == 429:
            if retry == 0:
                if 'Retry-After' in response.headers:
                    return '', 429, {'Retry-After': response.headers.get('Retry-After')}
                return '', 420

            logging.warning(
                'Received a 429 from mailjet, scheduling failed messages and returning'
            )
            cloud_task = CloudTasks(
                os.getenv('MAILJET_TASK_QUEUE'), os.getenv('APP_ENGINE_REGION')
            )
            cloud_task.add_to_queue(
                request_url,
                headers=headers,
                body=data,
                service_account_email=os.getenv('SERVICE_ACCOUNT'),
            )
            return '', 206

        if 200 <= response.status_code <= 299:
            mailjet_response = MailjetResponseModel(**response.json())

            data = json.loads(data)

            failed = [
                (message, result)
                for message, result in zip(data['messages'], mailjet_response.messages)
                if result.status == MailjetStatus.ERROR
            ]
            if failed:
                failed_messages, failed_results = map(list, zip(*failed))
                if failed_messages and retry < 3:
                    data['messages'] = failed_messages
                    return send_request(
                        json.dumps(data), headers, request_url, retry + 1
                    )
                if failed_messages and retry >= 3:
                    logging.error(
                        'Failed to send some e-mails. %s',
                        [element.dict() for element in failed_results],
                    )
        else:
            logging.error(
                '%s: %s', response.status_code, response.content.decode('utf-8')
            )
            return '', response.status_code
    except requests.exceptions.RequestException as e:
        print(f'Request failed with {str(e)}')
        raise e

    return '', 200


def send_mail_proxy(request):
    """Cloud function handler of flask.Request"""
    headers = {
        'Authorization': request.headers['X-Mailjet-Authorization'],
        'Content-type': request.headers['Content-type'],
    }

    return send_request(request.data.decode('utf-8'), headers, request.url)
