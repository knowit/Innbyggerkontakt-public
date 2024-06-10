import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import nb from 'date-fns/locale/nb';
import { useEffect, useState } from 'react';
import DatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { WrappedDateInput } from '.';
import './DatePickerStyled.scss';

registerLocale('nb', { ...nb, options: { ...nb.options, weekStartsOn: 0 } });

interface Props extends ReactDatePickerProps {
  onChange: (e: Date) => void;
  ref?: React.RefObject<DatePicker>;
  years?: number[];
  dateError?: string | undefined;
}

const DatePickerStyled: React.FC<Props> = ({
  selected,
  onChange,
  ref,
  disabled = false,
  id,
  years,
  dateFormat,
  placeholderText,
  customInput,
  dateError,
  minDate,
  maxDate,
}) => {
  const [timeSelectYears, setTimeSelectYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const timeSelectYears =
      years ||
      Array(130)
        .fill(currentYear - 120)
        .map((year, index) => parseInt(year) + index);
    if (minDate) {
      setTimeSelectYears(timeSelectYears.filter((year) => year >= minDate?.getFullYear()));
    } else {
      setTimeSelectYears(timeSelectYears);
    }
  }, []);

  const months = [
    'Januar',
    'Februar',
    'Mars',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return (
    <DatePicker
      id={id}
      locale={nb}
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        decreaseYear,
        increaseYear,
      }) => (
        <div className="dateSelectTest">
          <div className="selectWrapper">
            <ChevronLeft onClick={decreaseYear} focusable={true} tabIndex={0} />
            <select
              className="yearSelect"
              value={date.getFullYear()}
              onChange={({ target: { value } }) => {
                changeYear(+value);
              }}
            >
              {timeSelectYears.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronRight onClick={increaseYear} focusable={true} tabIndex={0} />
          </div>
          <div className="selectWrapper">
            <ChevronLeft onClick={decreaseMonth} focusable={true} tabIndex={0} />
            <select
              className="monthSelect"
              value={months[date.getMonth()]}
              onChange={({ target: { value } }) => {
                changeMonth(months.indexOf(value));
              }}
            >
              {months.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronRight onClick={increaseMonth} focusable={true} tabIndex={0} />
          </div>
        </div>
      )}
      selected={selected}
      onChange={(changedDate) => {
        onChange(changedDate as Date);
      }}
      closeOnScroll
      adjustDateOnChange
      dateFormat={dateFormat || 'dd.MM.yyyy HH:mm'}
      disabled={disabled}
      customInput={
        customInput ? customInput : <WrappedDateInput placeholderText={placeholderText} dateError={dateError} />
      }
      minDate={minDate || null}
      maxDate={maxDate || null}
      ref={ref}
    />
  );
};

export default DatePickerStyled;
