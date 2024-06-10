import { useLayoutEffect, useState } from 'react';
import * as api from 'utils/api';
import './ListObject.scss';

import { Button, Text } from 'components';
import firebase from 'firebase/compat/app';
import Image from '../../../atoms/Home/Image/Image';

interface Props {
  object: firebase.firestore.DocumentData;
  type: string;
  overskrift: string;
  antall?: string;
  onClick?: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
  className?: string;
}

export const ListObject: React.FC<Props> = ({ type, overskrift = '', onClick, object, className }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bulletinStatistikk, setBulletinStatistikk] = useState<any>();
  const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: 'short' };

  useLayoutEffect(() => {
    let mounted = true;
    if (type !== 'draft' && object.bulletin.type !== 'search') {
      api.getCampaignStatisticForBulletin(object.id).then((details) => {
        if (mounted) {
          setBulletinStatistikk(details.MessageSentCount);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Button className={`listObject ${className}`} onClick={onClick}>
        <Image content={object.bulletin.content} className="imageSizing" classNamePlaceholder="placeholder" />

        <div>
          {overskrift.length >= 29 ? (
            <Text className="regular14" style={{ marginTop: '7px' }}>
              {overskrift.substring(0, 20) + '...'}
            </Text>
          ) : (
            <Text className="regular14" style={{ marginTop: '7px' }}>
              {overskrift}
            </Text>
          )}

          {(() => {
            switch (type) {
              case 'draft':
                return (
                  <div>
                    {object.bulletin.lastChanged ? (
                      <Text className="regular11 gray">
                        Sist endret {new Date(object.bulletin.lastChanged).toLocaleDateString('no-NO', dateOptions)}
                      </Text>
                    ) : null}
                  </div>
                );

              case 'finished':
                return (
                  <Text className="regular11 gray">
                    Sendt til {bulletinStatistikk ? bulletinStatistikk : 0} personer
                  </Text>
                );

              case 'active':
                if (object.bulletin.type === 'search') {
                  return object?.bulletin.execution.datetime ? (
                    <Text className="regular11 gray">
                      Sendes den{' '}
                      {new Date(object?.bulletin.execution.datetime).toLocaleDateString('no-NO', dateOptions)}
                    </Text>
                  ) : (
                    <Text className="regular11 gray">Ingen dato satt</Text>
                  );
                }
                if (object.bulletin.type === 'event') {
                  return (
                    <Text className="regular11 gray">
                      Sendt til {bulletinStatistikk ? bulletinStatistikk : 0} personer
                    </Text>
                  );
                }
            }
          })()}

          <div className="listObjectTag">{object.bulletin.type === 'event' ? 'Automatisk' : 'Enkel'}</div>
          {object.bulletin.status === 'draft' && <div className="listObjectTag">Kladd</div>}
          {object.bulletin.status === 'finished' && object.bulletin.type === 'search' && (
            <div className="listObjectTag">
              {new Date(object?.bulletin.execution.datetime).toLocaleDateString('no-NO', dateOptions)}
            </div>
          )}
        </div>
      </Button>
    </>
  );
};

export default ListObject;
