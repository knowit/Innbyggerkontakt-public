import { useContext, useState } from 'react';

import { PopUpContext } from '../../contexts';

import Close from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

import { Pagination } from 'innbyggerkontakt-design-system';
import { StandardPopUp, Text } from '../../components';

import { RecipientsManual } from '../../models';

import './ManualRecipientsList.scss';

interface Props {
  className?: string;
  listType: RecipientsManual['listType'];
  recipients: Record<string, string>[];
  onChange?: (e: Record<string, string>[]) => void;
  deleteRecipient: (i: number) => void;
}

const ManualRecipientsList: React.FC<Props> = ({ listType, recipients, deleteRecipient }) => {
  const { setPopUp } = useContext(PopUpContext);

  const maxRecipientsList = 6;

  const [currentPage, setCurrentPage] = useState(1);
  const [sliceStart, setSliceStart] = useState(0);
  const [sliceEnd, setSliceEnd] = useState(maxRecipientsList);

  const handlePageClickLeft = () => {
    setCurrentPage(currentPage - 1);
    setSliceStart(sliceStart - maxRecipientsList);
    setSliceEnd(sliceEnd - maxRecipientsList);
  };
  const handlePageClickRight = () => {
    setCurrentPage(currentPage + 1);
    setSliceStart(sliceStart + maxRecipientsList);
    setSliceEnd(sliceEnd + maxRecipientsList);
  };

  const handleVisualText = (listElement: Record<string, string>) => {
    if (listType === 'email') {
      return listElement.email + (listElement.name ? `, ${listElement.name}` : '');
    }
  };

  return (
    <>
      {listType === 'email' ? (
        <>
          {recipients.slice(sliceStart, sliceEnd).map((recipient, i) => {
            return (
              <div className="usersInListWrapper" key={i}>
                <p className={'regular18 recipientText'}>{handleVisualText(recipient)}</p>
                <div
                  className="clickableIcon"
                  onClick={() => {
                    setPopUp(
                      <StandardPopUp
                        popUpMessage={`Er du sikker på at du vil fjerne mottakeren?`}
                        onPopUpAccept={() => deleteRecipient(i)}
                        acceptButtonText="Slett mottaker"
                        cancelButton="Avbryt"
                      />,
                    );
                  }}
                >
                  <Close className="userIcon" />
                </div>
              </div>
            );
          })}
          <div className="pagination">
            <Pagination
              disabledLeft={sliceStart === 0}
              disabledRight={currentPage === Math.ceil(recipients.length / maxRecipientsList)}
              activePage={currentPage}
              totalPage={Math.ceil(recipients.length / maxRecipientsList)}
              handlePageClickLeft={handlePageClickLeft}
              handlePageClickRight={handlePageClickRight}
            />
          </div>
        </>
      ) : (
        <div
          className={`docUpload ${false ? 'docUploadError' : 'textWrapper'}`}
          //style={style}
          tabIndex={0}
        >
          <div
            className="docUploadBox"
            //onDragOver={dragOver}
            //onDragEnter={dragEnter}
            //onDragLeave={dragLeave}
            //onDrop={fileDrop}
          >
            <FolderOpenIcon />
            <Text className="docUpload_topText">Fødselsnummer</Text>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualRecipientsList;
