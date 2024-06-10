import { useContext, useEffect } from 'react';
import Modal from 'react-modal';
import { PopUpContext } from '../../contexts';
import './PopupModal.scss';

export const PopupModal: React.FC = () => {
  const { popUp } = useContext(PopUpContext);

  const isPopup = (popUp && Object.keys(popUp).length > 0) || false;

  useEffect(() => {
    const element = document.getElementById('root');
    if (element) {
      Modal.setAppElement(element);
    }
  }, []);

  return (
    <Modal className="popUpModal" isOpen={isPopup}>
      {popUp}
    </Modal>
  );
};

export default PopupModal;
