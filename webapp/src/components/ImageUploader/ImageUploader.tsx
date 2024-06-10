import { ChangeEvent, DragEvent, useContext, useEffect, useState } from 'react';
import { Text, UploadButton } from '..';
import useUser from '../../hooks/useUser';
import { ValidationType } from '../../models';
import { FirebaseContext } from '../../utils/Firebase';
import fileStorage from '../../utils/Firebase/fileStorage';
import { ErrorMessage, RemoveImageButton, WarningMessage } from './components';
import './ImageUploader.scss';
import { validateFile } from './util';

interface Props {
  className?: string;
  altText: string;
  onChange: (file: string | undefined) => void;
  setWarningMessage: (message: string) => void;
  imageUrl: string | undefined;
  style?: React.CSSProperties | undefined;
  disabled?: boolean;
  validation: ValidationType[];
  location: string;
}

export const ImageUploader: React.FC<Props> = ({
  className,
  altText,
  imageUrl,
  onChange,
  setWarningMessage,
  style,
  disabled = false,
  validation,
  location,
}) => {
  const Firebase = useContext(FirebaseContext);
  const storage = new fileStorage(Firebase.storage, Firebase.storageRef);
  const { organizationId } = useUser();

  const [messageType, setMessageType] = useState<string>('');
  const [warningMinimized, setWarningMinimized] = useState<boolean>(false);
  const [shortMessage, setShortMessage] = useState<string>('');
  const [mediumMessage, setMediumMessage] = useState<string>('');
  const [longMessage, setLongMessage] = useState<string>('');

  useEffect(() => {
    if (warningMinimized) {
      setWarningMessage(mediumMessage);
    } else {
      setWarningMessage('');
    }
  }, [warningMinimized]);

  const dragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const dragEnter = (e: DragEvent) => {
    e.preventDefault();
  };

  const dragLeave = (e: DragEvent) => {
    e.preventDefault();
  };

  const fileDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      validateFile(validation, files[0]).then((result) => {
        setFeedbackAndUploadFile(result, files[0]);
      });
    }
  };

  const fileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      validateFile(validation, files[0]).then((result) => {
        setFeedbackAndUploadFile(result, files[0]);
      });
    }
  };

  const setFeedbackAndUploadFile = async (validationRule: ValidationType | undefined, file: File) => {
    if (validationRule && validationRule.type === 'error') {
      setMessageType(validationRule.type);
      setShortMessage(validationRule.shortMessage);
      setLongMessage(validationRule.longMessage);
    } else if (validationRule && validationRule.type === 'warning') {
      setMessageType(validationRule.type);
      setShortMessage(validationRule.shortMessage);
      setMediumMessage(validationRule.shortWarningMessage ? validationRule.shortWarningMessage : '');
      setLongMessage(validationRule.longMessage);
      uploadValidatedFiles(file, location);
    } else {
      uploadValidatedFiles(file, location);
    }
  };

  const uploadValidatedFiles = (file: File, location: string) => {
    if (!organizationId) return;
    storage.uploadFile(file, location, organizationId).then(async (result: string) => {
      onChange(result);
    });
  };

  const resetImage = () => {
    onChange('');
    setMessageType('');
    setWarningMinimized(false);
    setShortMessage('');
    setMediumMessage('');
    setLongMessage('');
  };

  return (
    <div
      className={
        (disabled ? 'divDisabled ' : '') +
        (className ? className + ' ' : '') +
        (messageType === 'error' ? 'imageUploadError ' : '') +
        (!!!imageUrl ? 'notUploaded ' : 'uploaded ') +
        'textWrapper imageUpload'
      }
      style={style}
      tabIndex={0}
    >
      {!!!imageUrl ? (
        <div
          className="imageUploadBox"
          style={{ flexDirection: 'column' }}
          onDragOver={dragOver}
          onDragEnter={dragEnter}
          onDragLeave={dragLeave}
          onDrop={fileDrop}
        >
          {messageType !== 'error' ? (
            <>
              <Text className="bold14">Dra bildefilen hit</Text>
              <Text className="regular14" style={{ padding: '1em 0' }}>
                eller
              </Text>
            </>
          ) : (
            <ErrorMessage shortMessage={shortMessage} longMessage={longMessage} />
          )}
          <UploadButton validateFile={fileUpload} />
        </div>
      ) : (
        <div className="imageUploaded" style={{}}>
          <img src={imageUrl} alt={altText} />
          <WarningMessage
            warning={messageType === 'warning' && !warningMinimized}
            setMinimized={() => {
              setWarningMinimized(true);
            }}
            shortMessage={shortMessage}
            longMessage={longMessage}
          />
          <RemoveImageButton onClick={() => resetImage()} />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
