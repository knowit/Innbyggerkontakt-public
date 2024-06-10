# pylint: disable=C0115,C0116
"""
Models for mailjet statistics response.

ref: https://dev.mailjet.com/email/reference/ .
"""
from datetime import date
from typing import List

from pydantic import BaseModel, Field


class CampaignData(BaseModel):
    """
    CampaignData about a specific campaign.

    creation and sending time, sender, subject, tracking options enabled etc.
    Each e-mail going through Mailjet is attached to a Campaign.

    Attributes:
        is_deleted: Indicates whether this campaign is deleted or not.
        is_starred: Indicates whether this campaign is marked as starred or not.
        campaign_type : Type of campaign:
            1 - Transactional
            2 - Marketing
            3 - Unknown
        click_tracked: Indicates whether click tracking has been enabled for this campaign (1) or not (2).
        created_at: Timestamp indicating when the campaign was created.
        custom_value: Custom unique tag for this campaign.
        first_message_id: Unique numeric ID of the first sent message for this campaign.
        from_email: Sender email address for this campaign.
        from_id: Unique numeric ID for the sender email address.
        from_name: Sender name selected for this campaign.
        has_html_count: Indicates whether the emails in this campaign have HTML content (1) or not (0).
        has_txt_count: Indicates whether the emails in this campaign have plain text content (1) or not (0).
        id: Unique numeric ID of this campaign.
        list_id: Unique numeric ID of the contact list, to which this campaign was sent.
        news_letter_id: Unique numeric ID of this campaign draft object linked to this campaign.
        open_tracked: Indicates whether click tracking has been enabled for this campaign (1) or not (2).
        segmentation_id: Unique numeric ID for the segmentation used for this campaign (see /contactfilter). Returned only if a segmentation is used for the campaign.
        send_end_at: Timestamp indicating when last message in this campaign was sent.
        SendStartAt: Timestamp indicating when first message in this campaign was sent.
        spamass_score: SpamAssassin score for this campaign.
        status: Status of this campaign.
        subject: Subject line used for the emails in this campaign.
        unsubscribe_tracked_count: Indicates whether unsubscribe tracking has been enabled for this campaign (1) or not (0).
        workflow_id: Unique numeric ID of the automation workflow that triggered this campaign. Returned only if a workflow is used for the campaign.
    """

    is_deleted: bool = Field(alias='IsDeleted')
    is_starred: bool = Field(alias='IsStarred')
    campaign_type: int = Field(alias='CampaignType')
    click_tracked: int = Field(alias='ClickTracked')
    created_at: str = Field(alias='CreatedAt')
    custom_value: str = Field(alias='CustomValue')
    first_message_id: str = Field(alias='FirstMessageID')
    from_email: str = Field(alias='FromEmail')
    from_id: str = Field(alias='FromID')
    from_name: str = Field(alias='FromName')
    has_html_count: int = Field(alias='HasHtmlCount')
    has_txt_count: int = Field(alias='HasTxtCount')
    id: str = Field(alias='ID')
    list_id: str = Field(default='', alias='ListID')
    news_letter_id: str = Field(alias='NewsLetterID')
    open_tracked: int = Field(alias='OpenTracked')
    segmentation_id: str = Field(default='', alias='SegmentationID')
    send_end_at: str = Field(alias='SendEndAt')
    send_start_at: str = Field(alias='SendStartAt')
    spamass_score: str = Field(alias='SpamassScore')
    status: str = Field(alias='Status')
    subject: str = Field(alias='Subject')
    unsubscribe_tracked_count: int = Field(alias='UnsubscribeTrackedCount')
    workflow_id: str = Field(default='', alias='WorkflowID')


class CampaignResponse(BaseModel):
    """
    CampaignResponse encapsulates `CampaignData` plus count and total.

    Attributes:
        count (str): Indicates the number of objects in the `CampaignData` array.
        data (List[CampaignData]): Contains list of all `CampaignData`.
        total (str): Indicates the number of objects in the `CampaignData` array.
    """

    count: str = Field(alias='Count')
    data: List[CampaignData] = Field(alias='Data')
    total: str = Field(alias='Total')


class StatCounterData(BaseModel):
    """
    Aggregated statistics for a specific campaign, list, API Key or sender email address.

    Attributes:
        api_key_id: Unique numeric ID for this API Key.
        event_click_delay: Total click delay (in seconds). Equals the sum of delays between the sending timestamp and click timestamp for all clicked messages (only taking into account the first click).
        event_clicked_count: Total number of click events.
        event_open_delay: Total Open delay (in seconds). Equals the sum of delays between the sending timestamp and open timestamp for all opened messages (only taking into account the first open).
        event_opened_count: Total number of open events.
        event_spam_count: Total number of spam reports.
        event_unsubscribed_count: Total number of unsubscriptions.
        event_workflow_exited_count: Total number of workflow exits.
        message_blocked_count: Number of blocked messages.
        message_clicked_count: Number of clicked messages.
        message_deferred_count: Number of deferred messages.
        message_hard_bounced_count: Number of hard-bounced messages.
        message_opened_count: Number of opened messages.
        message_queued_count: Number of queued messages.
        message_sent_count: Number of sent messages.
        message_soft_bounced_count: Number of soft-bounced messages.
        message_spam_count: Number of messages marked as spam.
        message_unsubscribed_count: Number of messages with unsubscribe requests.
        message_work_flow_exited_count: Number of contacts that exited a workflow.
        source_id: Unique numeric ID for a campaign, contact list or sender email address. Will indicate a campaign ID when CounterSource=Campaign, a list ID when CounterSource=List or a sender ID when CounterSource=Sender.
        timeslice: Timestamp for when the count was registered. Depends on the value selected for CounterResolution.
        total: Total number of processed messages.
    """

    api_key_id: str = Field(alias='APIKeyID', default='')
    event_click_delay: str = Field(alias='EventClickDelay', default='')
    event_clicked_count: int = Field(alias='EventClickedCount', default=0)
    event_open_delay: str = Field(alias='EventOpenDelay', default='')
    event_opened_count: int = Field(alias='EventOpenedCount', default=0)
    event_spam_count: int = Field(alias='EventSpamCount', default=0)
    event_unsubscribed_count: int = Field(alias='EventUnsubscribedCount', default=0)
    event_workflow_exited_count: int = Field(
        alias='EventWorkflowExitedCount', default=0
    )
    message_blocked_count: int = Field(alias='MessageBlockedCount', default=0)
    message_clicked_count: int = Field(alias='MessageClickedCount', default=0)
    message_deferred_count: int = Field(alias='MessageDeferredCount', default=0)
    message_hard_bounced_count: int = Field(alias='MessageHardBouncedCount', default=0)
    message_opened_count: int = Field(alias='MessageOpenedCount', default=0)
    message_queued_count: int = Field(alias='MessageQueuedCount', default=0)
    message_sent_count: int = Field(alias='MessageSentCount', default=0)
    message_soft_bounced_count: int = Field(alias='MessageSoftBouncedCount', default=0)
    message_spam_count: int = Field(alias='MessageSpamCount', default=0)
    message_unsubscribed_count: int = Field(alias='MessageUnsubscribedCount', default=0)
    message_work_flow_exited_count: int = Field(
        alias='MessageWorkFlowExitedCount', default=0
    )
    source_id: str = Field(alias='SourceID', default='')
    timeslice: str = Field(alias='Timeslice', default='')
    total: str = Field(alias='Total', default='')


class StatCounterResponse(BaseModel):
    """StatCounterResponse Surrounds the `StatCounterData` list."""

    count: str = Field(alias='Count')
    data: List[StatCounterData] = Field(alias='Data')
    total: str = Field(alias='Total')


class LinkStatisticsData(BaseModel):
    """Aggregated click statistics for a campaign bound to URL link."""

    clicked_events_count: int = Field(
        alias='ClickedEventsCount',
        description='Total number of click events for this link.',
    )
    clicked_messages_count: int = Field(
        alias='ClickedMessagesCount',
        description='Total number of messages, where this link was clicked at least once.',
    )
    position_index: int = Field(
        alias='PositionIndex',
        description='The position index of the URL link within the HTML content.',
    )
    url: str = Field(alias='URL')


class LinkStatisticsResponse(BaseModel):
    """Aggregated click statistics for a campaign, grouped by URL links."""

    count: str = Field(alias='Count')
    data: List[LinkStatisticsData] = Field(alias='Data')
    total: str = Field(alias='Total')


class CampaignOverviewData(BaseModel):
    """General details and stats for all drafts, AB Testing objects and/or sent campaigns."""

    clicked_count: int = Field(alias='ClickedCount', default=0)
    delivered_count: int = Field(alias='DeliveredCount', default=0)
    id: int = Field(alias='ID')
    processed_count: int = Field(alias='ProcessedCount', default=0)
    opened_count: int = Field(alias='OpenedCount', default=0)
    send_time_start: int = Field(alias='SendTimeStart', default=0)
    status: int = Field(alias='MessageDeferredCount', default=0)
    starred: bool = Field(alias='Starred', default=0)
    edit_mode: str = Field(alias='EditMode', default='unknown')
    edit_type: str = Field(alias='EditType', default='unknown')
    id_type: str = Field(alias='IDType', default='unknown')
    subject: str = Field(alias='Subject', default='unknown')
    title: str = Field(alias='Title', default='unknown')


class CampaignOverviewResponse(BaseModel):
    """`Contains a List of `CampaignOverviewData` in `data`."""

    count: str = Field(alias='Count')
    data: List[CampaignOverviewData] = Field(alias='Data')
    total: str = Field(alias='Total')


class DateToEvaluate(BaseModel):
    """Used to query statcounters."""

    date_to_evaluate: date
    time_delta: int
    campaign_id: str = ''
