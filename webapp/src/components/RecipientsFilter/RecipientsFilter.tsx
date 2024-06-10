import { checkCivilStatusToText, getShortAgeFilter } from '../../containers/CreateMessagePage/util';
import { BulletinRecipients, FilterTypes, RecipientsMatrikkel, RecipientsQuery } from '../../models';
import './RecipientsFilter.scss';

interface Props {
  filters: BulletinRecipients;
  borderDesign?: boolean;
}
export const RecipientsFilter: React.FC<Props> = ({ filters }) => {
  const recipientFilter = filters['query'] || filters['matrikkel'] || [];
  return (
    <div>
      {recipientFilter.map((filter: FilterTypes, i: number) => (
        <div key={'filter' + i} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
          {(() => {
            switch (filter.recipientFilter) {
              case 'alle':
                const alleFilter = filter as RecipientsQuery;
                return (
                  <div>
                    <div className="recipientsBlueBorder">Alle i din kommune </div>
                    {alleFilter.inkludererOppholdsadresse ? (
                      <div className="recipientsBlueBorder">Alle med oppholdsadresse i din kommune</div>
                    ) : null}
                  </div>
                );
              case 'folkeregister':
                const fregFilter = filter as RecipientsQuery;

                return (
                  <div>
                    <div className="recipientsBlueBorder">
                      Fast bostedsadresse{fregFilter.alder ? ', ' + getShortAgeFilter(fregFilter.alder) : ''}
                      {fregFilter.kjoenn ? ', ' + fregFilter.kjoenn : ''}
                      {fregFilter.sivilstandtype
                        ? ', Sivilstatus: ' + checkCivilStatusToText(fregFilter.sivilstandtype)
                        : ''}
                    </div>
                    {fregFilter.inkludererOppholdsadresse ? (
                      <div className="recipientsBlueBorder">
                        Oppholdsadresse{fregFilter.alder ? ', ' + getShortAgeFilter(fregFilter.alder) : ''}
                        {fregFilter.kjoenn ? ', ' + fregFilter.kjoenn : ''}
                        {fregFilter.sivilstandtype
                          ? ', Sivilstatus: ' + checkCivilStatusToText(fregFilter.sivilstandtype)
                          : ''}
                      </div>
                    ) : null}
                  </div>
                );
              case 'relasjon':
                const relFilter = filter as RecipientsQuery;

                return (
                  <div>
                    <div className="recipientsBlueBorder">
                      Fast bostedsadresse, Foresatte til barn{' '}
                      {relFilter.alder ? getShortAgeFilter(relFilter.alder) : ''}{' '}
                      {relFilter.kjoenn ? ', ' + relFilter.kjoenn : ''}
                      {relFilter.sivilstandtype
                        ? ', Sivilstatus: ' + checkCivilStatusToText(relFilter.sivilstandtype)
                        : ''}
                    </div>
                    {relFilter.inkludererOppholdsadresse ? (
                      <div className="recipientsBlueBorder">
                        Oppholdsadresse, Foresatte til barn {relFilter.alder ? getShortAgeFilter(relFilter.alder) : ''}{' '}
                        {relFilter.kjoenn ? ', ' + relFilter.kjoenn : ''}
                        {relFilter.sivilstandtype
                          ? ', Sivilstatus: ' + checkCivilStatusToText(relFilter.sivilstandtype)
                          : ''}
                      </div>
                    ) : null}
                  </div>
                );
              case 'matrikkel':
                const matrikkelFilter = filter as RecipientsMatrikkel;
                return (
                  <div className="recipientsBlueBorder">
                    Inkluderer : {matrikkelFilter.fritidsbolig ? 'fritidsboliger' : ''}
                  </div>
                );
              default:
                const defaultFilter = filter as RecipientsQuery;
                return (
                  <div>
                    <div className="recipientsBlueBorder">Alle i din kommune </div>
                    {defaultFilter.inkludererOppholdsadresse ? (
                      <div className="recipientsBlueBorder">Alle med oppholdsadresse i din kommune</div>
                    ) : null}
                  </div>
                );
            }
          })()}
        </div>
      ))}
    </div>
  );
};

export default RecipientsFilter;
