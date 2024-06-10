import { useEffect, useState } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuid } from 'uuid';
import { DatePickerStyled, FormWrapper } from '../index';
import './DateSelection.scss';

interface Props extends ReactDatePickerProps {
  date: Date | undefined;
  onChange: (e: Date) => void;
  showTitle?: boolean;
  dateError?: string | undefined;
}
const DateSelection: React.FC<Props> = ({
  date,
  onChange,
  dateFormat,
  className,
  disabled = false,
  required,
  title,
  placeholderText,
  showTitle,
  customInput,
  dateError,
  minDate,
  maxDate,
}) => {
  const [uniqueId] = useState<string>(uuid());

  useEffect(() => {
    if (date === undefined) {
      return;
    }
    const now = new Date();
    const newDate = new Date(
      date?.getFullYear() || now.getFullYear(),
      date?.getMonth() || now.getMonth(),
      date?.getDate() || now.getDate(),
    );
    onChange(newDate);
  }, []);

  return (
    <div className={`dateSelection ${className || ''}`}>
      <FormWrapper title={title} mandatory={required} showTitle={showTitle}>
        <div className="datePicker">
          <DatePickerStyled
            selected={date}
            onChange={onChange}
            disabled={disabled}
            id={uniqueId}
            dateFormat={dateFormat}
            placeholderText={placeholderText}
            customInput={customInput}
            dateError={dateError}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      </FormWrapper>
    </div>
  );
};

export default DateSelection;
