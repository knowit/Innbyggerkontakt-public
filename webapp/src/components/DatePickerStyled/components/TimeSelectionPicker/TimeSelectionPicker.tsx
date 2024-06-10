import { useRef, useState } from 'react';

//import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, TextFieldProps } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import './TimeSelectionPicker.scss';

interface Props {
  scheduleTime: Date | null | Dayjs;
  setScheduleTime: React.Dispatch<React.SetStateAction<Date | null>>;
}

const TimeSelectionPicker: React.FC<Props> = ({ scheduleTime, setScheduleTime }) => {
  const [timeError, setTimeError] = useState<string | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        value={scheduleTime}
        onError={(e) => {
          e ? setTimeError('Ugyldig klokkeslett') : setTimeError(null);
        }}
        onAccept={() => setTimeError('')}
        onChange={(e) => setScheduleTime(dayjs(e).toDate())}
        ampm={false}
        renderInput={(props: TextFieldProps) => (
          <TextField variant="outlined" helperText={timeError} ref={textRef} {...props} />
        )}
      />
    </LocalizationProvider>
  );
};

export default TimeSelectionPicker;
