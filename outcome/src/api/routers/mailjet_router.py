"""API router for mailjet-data."""
from datetime import date, datetime
from typing import List

from api.models.mailjet_response import LinkStatisticsData, StatCounterData
from api.routers.dependencies import auth
from api.services.mailjet_service import MailjetService
from fastapi import APIRouter, Depends, Path
from innbyggerkontakt import firebase


router = APIRouter()

# TODO: Fiks opp flere sjekker om backend autentisering ferdigstilles


@router.get('/stats/', response_model=List[StatCounterData])
def get_campaign_statistics_for_organization(
    user: firebase.User = Depends(auth.authorize),
):
    """Return mailjet statistics for every bulletin in the organization."""
    mailjet_service = MailjetService(user)
    return mailjet_service.get_campaign_statistics_for_api_key()


@router.get('/stats/{bulletin_id}', response_model=StatCounterData)
def get_campaign_statistic_for_bulletin(
    bulletin_id: str, user: firebase.User = Depends(auth.authorize)
):
    """Return mailjet statistics for single bulletin."""
    mailjet_service = MailjetService(user)
    return mailjet_service.get_campaign_statistics(bulletin_id)


@router.get(
    '/stats/interval/day/{bulletin_id}/{from_date}/{to_date}',
    response_model=List[StatCounterData],
)
def get_campaign_statistic_over_time_per_day(
    bulletin_id: str,
    from_date: date = Path(default=None, description='From date, format yyyy-mm-dd'),
    to_date: date = Path(default=None, description='To date, format yyyy-mm-dd'),
    user: firebase.User = Depends(auth.authorize),
):
    """Return mailjet statistics over time per day for single bulletin."""
    mailjet_service = MailjetService(user)
    return mailjet_service.get_statistcs_for_period(from_date, to_date, bulletin_id)


@router.get(
    '/stats/interval/hour/{bulletin_id}/{from_date}/{to_date}',
    response_model=List[StatCounterData],
)
def get_campaign_statistic_over_time_per_hour(
    bulletin_id: str,
    from_date: datetime = Path(
        default=None,
        description="Interval between from_date and to_date \
                                   can't be greater than 100 hours, isoStringFormat",
    ),
    to_date: datetime = Path(
        default=None,
        description="Interval between from_date and to_date can't be greater than 100 hours,\
                                  isoStringFormat",
    ),
    user: firebase.User = Depends(auth.authorize),
):
    """Return mailjet statistics over time per hour for single bulletin."""
    mailjet_service = MailjetService(user)
    return mailjet_service.get_campaign_statistic_over_time_for_bulletin(
        bulletin_id, from_date, to_date, 'Hours'
    )


@router.get('/linkstatistics/{bulletin_id}', response_model=List[LinkStatisticsData])
def get_link_statistics(
    bulletin_id: str, user: firebase.User = Depends(auth.authorize)
):
    """Return mailjet statistics over hyperlinks in bulletin."""
    mailjet_service = MailjetService(user)
    return mailjet_service.get_link_statistics(bulletin_id)


@router.get(
    '/stats/interval/total/day/{from_date}/{to_date}',
    response_model=List[StatCounterData],
)
def get_campaign_statistic_over_time_per_day_api_key(
    from_date: date = Path(default=None, description='From date, format yyyy-mm-dd'),
    to_date: date = Path(default=None, description='To date, format yyyy-mm-dd'),
    user: firebase.User = Depends(auth.authorize),
):
    """Return mailjet statistics over time per day for single bulletin."""
    mailjet_service = MailjetService(user)
    return mailjet_service.get_statistcs_for_period(from_date, to_date)


@router.get('/stats/lifetime/', response_model=List[StatCounterData])
def get_campaign_statistic_over_lifetime(user: firebase.User = Depends(auth.authorize)):
    """Return mailjet statistics over time per day for single bulletin."""
    mailjet_service = MailjetService(user)
    first_sendt_date = mailjet_service.get_first_sendt_campaign_date()
    return mailjet_service.get_statistcs_for_period(first_sendt_date)
