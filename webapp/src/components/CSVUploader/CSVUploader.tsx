import { ChangeEvent, DragEvent, useEffect, useState } from 'react';

import Papa, { ParseResult } from 'papaparse';
import { read, utils } from 'xlsx';
import { Text, UploadButton } from '../../components';

import { RecipientsManual } from '../../models';

import * as EmailValidator from 'email-validator';

import './CSVUploader.scss';

interface Props {
  listType: RecipientsManual['listType'];
  onChange: (e: Record<string, string>[]) => void;
  setErrorLines: (e: number[]) => void;
}

const CSVUploader: React.FC<Props> = ({ listType, onChange, setErrorLines }) => {
  const validationTypes =
    'text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const dragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const dragEnter = (e: DragEvent) => {
    e.preventDefault();
  };

  const dragLeave = (e: DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    setError(false);
    setErrorMessage('');
  }, [listType]);

  const castResultToValues = (parsedContent: ParseResult<unknown>) => {
    //TODO: When parsing different inputs, this might be used to make it right

    if (parsedContent.data.length > 10000) {
      setError(true);
      setErrorMessage('Listen er for lang. Vennligst del opp listen i mindre biter og last dem opp separat.');
      return [];
    }
    let failedValidation = '';
    const resultingObjects = parsedContent.data.map((element, index) => {
      switch (listType) {
        case 'email':
          const emailLineValidation = validateEmailList(element as Record<string, string>);
          if (Object.keys(emailLineValidation).length === 0 || !Object.keys(emailLineValidation).includes('email')) {
            failedValidation += `${index + 2},`;
            return {};
          }
          return emailLineValidation;
        case 'identifier':
          const identifierLineValidation = validateIdentifierList(element as Record<string, string>);
          if (Object.keys(identifierLineValidation).length === 0) {
            failedValidation += `${index + 2},`;
            return {};
          }
          return identifierLineValidation;
        default:
          return {};
      }
    });
    const listOfFailedValidation = failedValidation
      .split(',')
      .map((text) => {
        return parseInt(text);
      })
      .filter((number) => !isNaN(number));
    if (resultingObjects.length <= listOfFailedValidation.length) {
      setError(true);
      setErrorMessage('Ingen elementer i listen ble validert. Vennligst påse at dokumentet oppfyller kravene ovenfor.');
      return [];
    } else {
      setErrorLines(listOfFailedValidation);
      return resultingObjects.filter((line) => Object.keys(line).length !== 0);
    }
  };

  const validateEmailList = (element: Record<string, string>) => {
    let returnValue = {};
    const keys = Object.keys(element);
    const reducedKeys = keys.map((key) => {
      return key.replace(' ', '').replace('-', '').replace('.', '').toLowerCase();
    });

    const reducedMailKey = reducedKeys.find((key) => key.includes('epost'));
    if (reducedMailKey && EmailValidator.validate(element[keys[reducedKeys.indexOf(reducedMailKey)]])) {
      returnValue = { ...returnValue, email: element[keys[reducedKeys.indexOf(reducedMailKey)]] };

      // The name is only processed if the email exists, as the name is irrelevant if email doesn't exist
      if (reducedKeys.includes('navn')) {
        const reducedKeyIndex = reducedKeys.indexOf('navn');
        returnValue = { ...returnValue, name: element[keys[reducedKeyIndex]] };
      } else if (reducedKeys.includes('fulltnavn')) {
        const reducedKeyIndex = reducedKeys.indexOf('fulltnavn');
        returnValue = { ...returnValue, name: element[keys[reducedKeyIndex]] };
      } else if (reducedKeys.includes('fornavn')) {
        const reducedKeyIndex = reducedKeys.indexOf('fornavn');
        const middleNameKey = reducedKeys.indexOf('mellomnavn');
        const lastNameKey = reducedKeys.indexOf('etternavn');

        const connectedName = `${element[keys[reducedKeyIndex]]}${
          keys[middleNameKey] ? ` ${element[keys[middleNameKey]]}` : ''
        }${keys[lastNameKey] ? ` ${element[keys[lastNameKey]]}` : ''}`;
        returnValue = { ...returnValue, name: connectedName };
      } else if (reducedKeys.includes('etternavn')) {
        const reducedKeyIndex = reducedKeys.indexOf('etternavn');
        if (keys[reducedKeyIndex]) {
          returnValue = { ...returnValue, name: element[keys[reducedKeyIndex]] };
        }
      }
    }

    return returnValue;
  };

  const validateIdentifierList = (element: Record<string, string>) => {
    let returnValue = {};
    const keys = Object.keys(element);
    const reducedKeys = keys.map((key) => {
      return key.replace(' ', '').replace('-', '').replace('.', '').toLowerCase();
    });

    if (reducedKeys.includes('fødselsnummer')) {
      const reducedKeyIndex = reducedKeys.indexOf('fødselsnummer');
      returnValue = { identifier: element[keys[reducedKeyIndex]] };
    } else if (reducedKeys.includes('personnummer')) {
      const reducedKeyIndex = reducedKeys.indexOf('personnummer');
      returnValue = { identifier: element[keys[reducedKeyIndex]] };
    }

    return returnValue;
  };

  const uploadedFiles = async (file: File) => {
    let checkedFile;
    switch (file.type) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        const data = await transformToArrayBuffer(file);
        const workbook = read(data);
        const wsName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[wsName];

        const xlsxToCsv = utils.sheet_to_csv(worksheet);
        checkedFile = xlsxToCsv;
        break;
      default:
        checkedFile = file;
        break;
    }

    Papa.parse(checkedFile, {
      skipEmptyLines: true,
      header: true,
      complete: (e) => {
        onChange(castResultToValues(e));
      },
    });
  };

  const transformToArrayBuffer = async (params: File) => {
    const result = await params.arrayBuffer();
    return result;
  };

  const fileDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length && validationTypes.split(',').includes(files[0].type.toLowerCase())) {
      uploadedFiles(files[0]);
    } else {
      setError(true);
      setErrorMessage('Filen du lastet opp er i feil format. Støttede filer er csv og xlsx.');
    }
  };

  const fileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length && validationTypes.split(',').includes(files[0].type.toLowerCase())) {
      uploadedFiles(files[0]);
    } else {
      setError(true);
      setErrorMessage('Filen du lastet opp er i feil format. Støttede filer er csv og xlsx.');
    }
  };

  return (
    <>
      {error && <Text className="textError">{errorMessage}</Text>}
      <div
        className={`docUpload ${error ? 'docUploadError' : 'textWrapper'}`}
        //style={style}
        tabIndex={0}
      >
        <div
          className="docUploadBox"
          onDragOver={dragOver}
          onDragEnter={dragEnter}
          onDragLeave={dragLeave}
          onDrop={fileDrop}
        >
          <Text className="docUpload_topText">Dra filen hit</Text>
          <Text className="regular14" style={{ padding: '1em 0' }}>
            eller
          </Text>
          <UploadButton validateFile={fileUpload} />
        </div>
      </div>
    </>
  );
};

export default CSVUploader;
