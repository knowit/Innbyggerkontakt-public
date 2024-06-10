import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useMap } from 'contexts/MapContext';
import { Feature, Polygon, FeatureCollection } from 'geojson';
import { MapButton } from 'innbyggerkontakt-design-system';
import Edit from '@mui/icons-material/Edit';
import Add from '@mui/icons-material/Add';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Delete from '@mui/icons-material/DeleteOutline';
import './InitialButtons.scss';

type Props = {
  selectedPolygon: Feature<Polygon> | undefined;
  polygons: FeatureCollection<Polygon>;
  setSelectedPolygon: (polygon: Feature<Polygon> | undefined) => void;
  backCallback: () => void;
  setLocalDrawMode: (mode: MapboxDraw.DrawMode) => void;
};

export const InitialButtons = ({
  selectedPolygon,
  polygons,
  setSelectedPolygon,
  backCallback,
  setLocalDrawMode,
}: Props) => {
  const { setFullscreen, setDrawMode, draw } = useMap();

  const handleBackButton = () => {
    setFullscreen(false);
    setSelectedPolygon(undefined);
    backCallback();
  };

  const handleDeletePolygon = () => {
    if (selectedPolygon) {
      setDrawMode('simple_select', selectedPolygon.id as string);
      draw.current?.trash();
      setSelectedPolygon(undefined);
    }
  };

  return (
    <>
      <MapButton
        key={polygons.features.length}
        onClick={handleBackButton}
        className={`drawmap__button drawmap__button__editback ${
          polygons.features.length > 0 ? 'drawmap__button__newstyle' : ''
        }`}
        color={polygons.features.length > 0 ? 'primary' : 'mint'}
      >
        <ChevronLeft />
        {polygons.features.length > 0 ? 'Ferdig' : 'Tilbake'}
      </MapButton>
      <MapButton
        className="drawmap__button drawmap__button__third"
        color="secondary"
        onClick={() => {
          setDrawMode('draw_polygon');
          setLocalDrawMode('draw_polygon');
        }}
      >
        {polygons.features.length === 0 ? (
          <>
            <Add /> Legg til polygon
          </>
        ) : (
          <>
            <Edit />
            Legg til flere områder
          </>
        )}
      </MapButton>

      <MapButton
        color="secondary"
        className="drawmap__button drawmap__button__delete"
        disabled={selectedPolygon === undefined}
        onClick={handleDeletePolygon}
      >
        <Delete />
        Slett
      </MapButton>
    </>
  );
};
