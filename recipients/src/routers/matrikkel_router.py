"""Routing requests."""
from fastapi import APIRouter, Header

from models import query_model
from services.matrikkel.service.matrikkel_service import MatrikkelService


router = APIRouter()


@router.post('/cabin_owners/{bulletin_id}')
def matrikkel_cabin_owners(
    bulletin_id: str,
    organization_id: str = Header(...),
    municipality_number: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """
    Add cabin owners to bulletin.

    Args:
        bulletin_id (str): bulletin id
        organization_id (str, optional): organization id. Defaults to Header(...).
        municipality_number (str, optional): municipality number. Defaults to Header(...).
        bulletin_type (query_model.BulletinType, optional): bulletun type. Defaults to Header(...).

    Returns:
         dict[str, Any]: metadata with query date and hits
    """
    return MatrikkelService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).add_cabin_owners()


@router.post('/oslo_reg_roa/{bulletin_id}')
def matrikkel_oslo_reg_roa(
    bulletin_id: str,
    organization_id: str = Header(...),
    municipality_number: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """
    Add cabin owners to bulletin.

    Args:
        bulletin_id (str): bulletin id
        organization_id (str, optional): organization id. Defaults to Header(...).
        municipality_number (str, optional): municipality number. Defaults to Header(...).
        bulletin_type (query_model.BulletinType, optional): bulletun type. Defaults to Header(...).

    Returns:
         dict[str, Any]: metadata with query date and hits
    """
    return MatrikkelService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).add_oslo_reg_roa()


@router.post('/oslo_reg_bjerke/{bulletin_id}')
def matrikkel_oslo_reg_bjerke(
    bulletin_id: str,
    organization_id: str = Header(...),
    municipality_number: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """
    Add cabin owners to bulletin.

    Args:
        bulletin_id (str): bulletin id
        organization_id (str, optional): organization id. Defaults to Header(...).
        municipality_number (str, optional): municipality number. Defaults to Header(...).
        bulletin_type (query_model.BulletinType, optional): bulletun type. Defaults to Header(...).

    Returns:
         dict[str, Any]: metadata with query date and hits
    """
    return MatrikkelService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).add_oslo_reg_bjerke()


@router.post('/oslo_reg_nordre_aker/{bulletin_id}')
def matrikkel_oslo_reg_nordre_aker(
    bulletin_id: str,
    organization_id: str = Header(...),
    municipality_number: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """
    Add cabin owners to bulletin.

    Args:
        bulletin_id (str): bulletin id
        organization_id (str, optional): organization id. Defaults to Header(...).
        municipality_number (str, optional): municipality number. Defaults to Header(...).
        bulletin_type (query_model.BulletinType, optional): bulletun type. Defaults to Header(...).

    Returns:
         dict[str, Any]: metadata with query date and hits
    """
    return MatrikkelService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).add_oslo_reg_nordre_aker()


@router.post('/oslo_reg_grorud/{bulletin_id}')
def matrikkel_oslo_reg_grorud(
    bulletin_id: str,
    organization_id: str = Header(...),
    municipality_number: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """
    Add cabin owners to bulletin.

    Args:
        bulletin_id (str): bulletin id
        organization_id (str, optional): organization id. Defaults to Header(...).
        municipality_number (str, optional): municipality number. Defaults to Header(...).
        bulletin_type (query_model.BulletinType, optional): bulletun type. Defaults to Header(...).

    Returns:
         dict[str, Any]: metadata with query date and hits
    """
    return MatrikkelService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).add_oslo_reg_grorud()


@router.post('/oslo_reg_stovner/{bulletin_id}')
def matrikkel_oslo_reg_stovner(
    bulletin_id: str,
    organization_id: str = Header(...),
    municipality_number: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """
    Add cabin owners to bulletin.

    Args:
        bulletin_id (str): bulletin id
        organization_id (str, optional): organization id. Defaults to Header(...).
        municipality_number (str, optional): municipality number. Defaults to Header(...).
        bulletin_type (query_model.BulletinType, optional): bulletun type. Defaults to Header(...).

    Returns:
         dict[str, Any]: metadata with query date and hits
    """
    return MatrikkelService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).add_oslo_reg_stovner()
