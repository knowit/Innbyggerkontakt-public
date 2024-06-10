import { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import {
  CreateMessageError,
  CreateMessageHeader,
  NavigationButton,
  RadioField,
} from '../../../containers/CreateMessagePage/components';
import { PopUpContext, StoreContext } from '../../../contexts';
import { Bulletin, BulletinEvent, BulletinRecipients, OptionType } from '../../../models';
import './EventForm.scss';

export const eventAlternatives = [
  { value: 'flyttingTilKommune', label: 'Noen flytter til kommunen' },
  { value: 'endringIAlder', label: 'Noen fyller år eller månder' },
  { value: 'flyttingInnenKommune', label: 'Noen flytter innad i kommunen' },
];

export const getEventFromValue = (eventValue: string | undefined) => {
  const event = eventAlternatives.find((alternative) => alternative.value === eventValue);
  return event ? event : eventAlternatives[0];
};

interface Props {
  onClickNext: () => void;
}

type Inputs = {
  eventType: OptionType;
};
// TODO: fiks opp at det er default variabler fra hook forms som brukes. Gjør også at det er verdier fra formet som brukes.
const EventForm: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const { setPopUp } = useContext(PopUpContext);
  const currentBulletin = store.currentBulletin;
  const dbAccess = store.dbAccess;
  const currentBulletinId = store.currentBulletinId;

  const preloadedValues = {
    eventType: getEventFromValue(currentBulletin?.recipients?.event?.eventType),
  };

  const { handleSubmit, control, getValues, setValue } = useForm<Inputs>({
    defaultValues: preloadedValues,
    shouldFocusError: true,
  });

  const postBulletin = (data: Inputs) => {
    if (currentBulletin) {
      const prevRecipients = currentBulletin?.recipients || {};
      const prevEvent: BulletinEvent = currentBulletin?.recipients?.event || {};

      const eventType = (data.eventType as OptionType).value;
      // TODO: Fix opp reason. Akkurat nå bare hardkodet ettersom vi ikke har noe valg for dette
      const event: BulletinEvent = {
        ...prevEvent,
        eventType: eventType,
        reason: setReason(eventType),
      };
      const recipients: BulletinRecipients = { ...prevRecipients, event };
      const bulletin: Bulletin = {
        ...currentBulletin,
        recipients,
      };
      store.setBulletin(bulletin);
      if (currentBulletinId) {
        dbAccess.persistBulletin(bulletin, currentBulletinId);
      }
    }
    onClickNext();
  };

  const post = (data: Inputs) =>
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(data))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  const setReason = (eventType: string) => {
    let reason = undefined;
    if (eventType.length > 0) {
      (() => {
        switch (eventType) {
          case 'flyttingTilKommune':
            reason = ['Innflytting til annen kommune'];
            break;
          case 'flyttingInnenKommune':
            reason = ['Flytting internt i din kommune'];
            break;
          case 'endringIAlder':
            reason = ['Endring i alder'];
            break;
        }
      })();
    }
    return reason;
  };

  return (
    <>
      <form className="eventPageForm" onSubmit={handleSubmit(post)}>
        <CreateMessageHeader
          title="Hendelse"
          description="Her bestemmer du hendelsen som trigger at en melding blir utsendt. Man kan sende meldingen til de hendelsen skjer med eller noen i en relasjon til den hendelsen omhandler. "
        />
        <div className="nameRow">
          <Controller
            render={({}) => (
              <div className="radioButtonsBox">
                {eventAlternatives.map((event) => (
                  <RadioField
                    value={event.value}
                    title={event.label}
                    key={event.value}
                    checked={(getValues('eventType') as OptionType).value === event.value}
                    onChange={(e) => {
                      setValue('eventType', getEventFromValue(e.target.value));
                    }}
                  />
                ))}
              </div>
            )}
            control={control}
            name="eventType"
          />
        </div>
        <NavigationButton />
      </form>
    </>
  );
};

export default EventForm;
