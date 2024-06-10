import './PercentBox.scss';
interface Props {
  className?: string;
  mailSentCount?: number;
  mailClickedCount: number;
  mailOpenedCount: number;
  mailBouncedCount: number;

  //prosent info
}

export const PercentBox: React.FC<Props> = ({
  className,
  mailSentCount,
  mailClickedCount = 0,
  mailOpenedCount = 0,
  mailBouncedCount = 0,
}) => {
  return (
    <div className={`percentBox ${className}`}>
      <div className="wrapperHorizontal">
        <p className="semibold24 lightBlue">{mailSentCount}</p>
        <p className="regular18 lightBlue">sendt</p>
      </div>

      <div className="wrapperHorizontal">
        <p className="semibold24 lightBlue">{Math.round(mailClickedCount).toString()}%</p>
        <p className="regular18 lightBlue">klikker</p>
      </div>

      <div className="wrapperHorizontal">
        <p className="semibold24 lightBlue">{Math.round(mailOpenedCount).toString()}%</p>
        <p className="regular18 lightBlue">åpner</p>
      </div>

      <div className="wrapperHorizontal">
        <p className="semibold24 lightBlue">{Math.round(mailBouncedCount).toString()}%</p>
        <p className="regular18 lightBlue">avvist</p>
      </div>
    </div>
  );
};

export default PercentBox;
