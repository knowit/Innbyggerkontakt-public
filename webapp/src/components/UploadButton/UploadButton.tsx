import { ChangeEvent, useRef } from 'react';
import { Button } from '../Button/Button';

interface UploadButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  validateFile: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ className, validateFile }) => {
  const fileUploadRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        className={`secondary ${className}`}
        onClick={() => {
          fileUploadRef.current?.click();
        }}
      >
        Velg fil
      </Button>
      <input type="file" ref={fileUploadRef} onChange={validateFile} style={{ display: 'none' }} />
    </>
  );
};

export default UploadButton;
