import { Pagination } from 'innbyggerkontakt-design-system';
import { useContext, useEffect, useState } from 'react';
import { Loader } from '../../../components';
import { StoreContext } from '../../../contexts';
import { useUser } from '../../../hooks';
import { Bulletin, InvoiceType } from '../../../models';
import NewsObject from '../NewsObject';

import './News.scss';

interface Props {
  listmax?: number;
}

export type BulletinData = {
  id: string;
  bulletin: Bulletin;
  invoice?: InvoiceType;
};

export const News: React.FC<Props> = ({ listmax = 7 }) => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const [bulletins, setBulletins] = useState<BulletinData[]>([]);
  const [completeBulletin, setCompleteBulletin] = useState<BulletinData[]>([]);
  const { organizationId } = useUser();

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [sliceStart, setSliceStart] = useState(0);
  const [sliceEnd, setSliceEnd] = useState(listmax);

  const handlePageClickLeft = () => {
    setCurrentPage(currentPage - 1);
    setSliceStart(sliceStart - listmax);
    setSliceEnd(sliceEnd - listmax);
  };
  const handlePageClickRight = () => {
    setCurrentPage(currentPage + 1);
    setSliceStart(sliceStart + listmax);
    setSliceEnd(sliceEnd + listmax);
  };

  useEffect(() => {
    if (organizationId) {
      dbAccess.getAllBulletinsFromOrganization(organizationId).then((results) => {
        let tempBulletins: BulletinData[] = [];
        results.forEach((snapshot) =>
          snapshot?.forEach((doc) => {
            const data = doc.data() as Bulletin;

            tempBulletins = [
              ...tempBulletins,
              {
                id: doc.id,
                bulletin: {
                  ...data,
                  type: data.type ? data.type : data.channel.type,
                  channel: data.channel
                    ? data.channel.name === 'email'
                      ? { name: 'email', type: data.channel.type }
                      : { name: 'sms', type: 'search' }
                    : { name: 'email', type: data.type },
                },
              },
            ];
          }),
        );
        tempBulletins = tempBulletins.sort((a, b) =>
          new Date(a.bulletin?.lastChanged ?? '') < new Date(b.bulletin?.lastChanged ?? '') ? 1 : -1,
        );
        setBulletins(tempBulletins);
      });
    }
  }, [organizationId]);

  useEffect(() => {
    const fetch = async () => {
      const tempBulletins: BulletinData[] = [];
      await Promise.all(
        bulletins.map(async (bulletin) => {
          await dbAccess.getBulletinInvoice(bulletin.id).then((invoice) => {
            bulletin = {
              ...bulletin,
              invoice: invoice
                ? {
                    orgnr: invoice?.orgnr,
                    name: invoice?.name,
                    postnr: invoice?.postnr,
                    postcity: invoice?.postcity,
                    address: invoice?.address,
                    sender_name: invoice?.sender_name,
                    ref: invoice?.ref,
                    tjeneste: invoice?.tjeneste,
                  }
                : undefined,
            };
            tempBulletins.push(bulletin);
          });
        }),
      );
      setCompleteBulletin(tempBulletins);
    };
    fetch().then(() => {
      setLoading(false);
    });
  }, [bulletins]);

  return (
    <div className="newsListContainer">
      {loading ? (
        <Loader />
      ) : (
        completeBulletin.slice(sliceStart, sliceEnd).map((e, id) => {
          return <NewsObject key={id} bulletin={e.bulletin} bulletinId={e.id} invoice={e.invoice} />;
        })
      )}

      {completeBulletin.length > listmax && listmax > 5 && (
        <div className="pagination">
          <Pagination
            disabledLeft={sliceStart === 0}
            disabledRight={currentPage === Math.ceil(completeBulletin.length / listmax)}
            activePage={currentPage}
            totalPage={Math.ceil(completeBulletin.length / listmax)}
            handlePageClickLeft={handlePageClickLeft}
            handlePageClickRight={handlePageClickRight}
          />
        </div>
      )}
    </div>
  );
};
export default News;
