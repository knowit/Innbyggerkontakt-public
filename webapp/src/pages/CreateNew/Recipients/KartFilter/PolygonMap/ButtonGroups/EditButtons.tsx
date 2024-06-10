import MapboxDraw from '@mapbox/mapbox-gl-draw';
import Check from '@mui/icons-material/Check';
import { useMap } from 'contexts/MapContext';
import { MapButton } from 'innbyggerkontakt-design-system';
import { EditBanner } from './EditBanner';

import './InitialButtons.scss';

type Props = {
  setLocalDrawMode: (mode: MapboxDraw.DrawMode) => void;
};

export const EditButtons = ({ setLocalDrawMode }: Props) => {
  const { setDrawMode, draw, map } = useMap();

  const handleFinishDrawing = () => {
    setDrawMode('simple_select');
    setLocalDrawMode('simple_select');
  };

  const handleCancelDrawing = () => {
    //! Need to check if polygon is created
    const createListener = (e: MapboxDraw.DrawCreateEvent) => {
      if (e.features.length > 0) {
        setDrawMode('simple_select', e.features[0].id as string);
        draw.current?.trash();
      }
    };

    map.current?.once('draw.create', createListener);

    //! Triggering to cancel draw mode
    setDrawMode('simple_select');
    setLocalDrawMode('simple_select');

    setTimeout(() => {
      map.current?.off('draw.create', createListener);
    }, 0);
  };
  return (
    <>
      <EditBanner />
      <MapButton
        onClick={handleFinishDrawing}
        className="drawmap__button drawmap__button__cancel drawmap__button__newstyle"
      >
        <Check />
        Ferdig
      </MapButton>
      <MapButton className="drawmap__button drawmap__button__delete" color="mint" onClick={handleCancelDrawing}>
        Avbryt
      </MapButton>
    </>
  );
};
