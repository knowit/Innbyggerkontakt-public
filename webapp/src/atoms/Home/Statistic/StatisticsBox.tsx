interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulletinStatistikk: any;
  sent?: boolean;
}

export const StatisticsBox: React.FC<Props> = ({ bulletinStatistikk, sent }) => {
  return (
    <div className="summaryBox" style={{ textAlign: 'center' }}>
      <div className="flexWrapper" style={{ justifyContent: 'center' }}>
        <p className="semibold24 lightBlue">{bulletinStatistikk?.mailsSent ? bulletinStatistikk?.mailsSent : 0}</p>
        <p className="regular18 lightBlue">personer</p>
      </div>

      <p className="regular11">
        {sent ? 'Mottok e-posten.' : 'Skal motta e-posten.'} Filteret fant{' '}
        {bulletinStatistikk?.fregTotalHits ? bulletinStatistikk?.fregTotalHits : 0} personer. Av disse hadde{' '}
        {bulletinStatistikk?.reserved ? bulletinStatistikk?.reserved : 0} reservert seg mot digital kommunikasjon og{' '}
        {bulletinStatistikk?.notActive ? bulletinStatistikk?.notActive : 0} var uten e-postaddresse.
      </p>
    </div>
  );
};

export default StatisticsBox;
