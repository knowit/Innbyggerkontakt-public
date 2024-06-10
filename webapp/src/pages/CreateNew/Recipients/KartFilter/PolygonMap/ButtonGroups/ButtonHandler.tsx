import { useEffect, useState } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature, Polygon, FeatureCollection } from 'geojson';
import { useMap } from 'contexts/MapContext';
import { InitialButtons } from './InitialButtons';
import { EditButtons } from './EditButtons';

import './InitialButtons.scss';

type Props = {
  backCallback: () => void;
  selectedPolygon: Feature<Polygon> | undefined;
  setSelectedPolygon: (polygon: Feature<Polygon> | undefined) => void;
  polygons: FeatureCollection<Polygon>;
};

export const ButtonHandler = ({ selectedPolygon, setSelectedPolygon, backCallback, polygons }: Props) => {
  const { drawMode, map } = useMap();
  const [localDrawMode, setLocalDrawMode] = useState(drawMode);

  useEffect(() => {
    const handleDrawModeChange = (e: MapboxDraw.DrawModeChangeEvent) => {
      setLocalDrawMode(e.mode);
    };

    map.current?.on('draw.modechange', handleDrawModeChange);

    return () => {
      map.current?.off('draw.modechange', handleDrawModeChange);
    };
  }, []);

  return (
    <div className="drawmap_container">
      {localDrawMode !== 'draw_polygon' ? (
        <InitialButtons
          backCallback={backCallback}
          polygons={polygons}
          selectedPolygon={selectedPolygon}
          setLocalDrawMode={setLocalDrawMode}
          setSelectedPolygon={setSelectedPolygon}
        />
      ) : (
        <EditButtons setLocalDrawMode={setLocalDrawMode} />
      )}
    </div>
  );
};
