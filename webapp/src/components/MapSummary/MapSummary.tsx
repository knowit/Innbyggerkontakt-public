import { useEffect, useRef, useState } from 'react';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import { DrawSelectionChangeEvent } from '@mapbox/mapbox-gl-draw';
import { useMap } from 'contexts/MapContext';
import { Button } from 'innbyggerkontakt-design-system';
import { RecipientsKart } from 'models';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

import './MapSummary.scss';
import Loader from 'components/Loader/Loader';

type Props = {
  filter: RecipientsKart;
};

export const MapSummary = ({ filter }: Props) => {
  //! The context from the map provider
  const {
    map,
    mapIsReady,

    injectMapToContainer,
    setDrawMode,
    setInteractive,

    focusOnPolygon,
    focusOnPolygons,

    resetMap,
  } = useMap();

  const container = useRef<HTMLDivElement | null>(null);
  const [polygons, setPolygons] = useState<FeatureCollection<Polygon> | undefined>(undefined);
  const [selectedPolygon, setSelectedPolygon] = useState<Feature<Polygon> | undefined>(undefined);
  const [showAll, setShowAll] = useState(true);

  //! Executes when the map is ready or at mount, to inject the map and turn on interactivity
  useEffect(() => {
    if (mapIsReady && container.current) {
      injectMapToContainer(container.current);
      setInteractive(true);
    }
    return () => {
      resetMap();
    };
  }, [mapIsReady]);

  useEffect(() => {
    if (filter) {
      setPolygons(filter?.polygons ? JSON.parse(filter.polygons) : { type: 'FeatureCollection', features: [] });
    }
  }, [filter]);

  //! Executes when the polygons or fullscreen changes, to update listeners
  useEffect(() => {
    if (mapIsReady && map.current) {
      addListeners();
      if (polygons && polygons.features.length > 0) {
        setTimeout(() => focusOnPolygons(polygons), 100);
      }
    }
    return () => {
      removeListeners();
    };
  }, [polygons, mapIsReady]);

  //! Sets focus and selection on changes to showAll state
  useEffect(() => {
    if (showAll && polygons && polygons.features.length > 0 && mapIsReady) {
      setSelectedPolygon(undefined);
      setTimeout(() => focusOnPolygons(polygons), 0);
    }
  }, [showAll, polygons]);

  //! Collection of listeners to be added to the map
  const addListeners = () => {
    map.current?.on('draw.selectionchange', selectionListener);
  };

  const removeListeners = () => {
    map.current?.off('draw.selectionchange', selectionListener);
  };

  const selectionListener = (e: DrawSelectionChangeEvent) => {
    if (e.features.length > 0) {
      const polygon = e.features[0] as Feature<Polygon>;
      setSelectedPolygon(polygon);
    } else {
      setSelectedPolygon(undefined);
    }
    setDrawMode('simple_select');
  };

  const handleSelectedPolygonButton = (polygon: Feature<Polygon>) => {
    setSelectedPolygon(polygon);
    setShowAll(false);
    focusOnPolygon(polygon);
  };

  const handleShowAllButton = () => {
    setShowAll(true);
    if (polygons) focusOnPolygons(polygons);
  };

  return mapIsReady ? (
    <div className={`mapSummary ${polygons && polygons.features.length > 0 ? '' : 'polygonMap__hidden'}     `}>
      <Button
        variant="rounded"
        color="tertiary"
        svg={[14, 16]}
        className={`mapSummary--selfCenter ${showAll ? 'polygon_map__button' : ''}`}
        onClick={handleShowAllButton}
      >
        <VisibilityOutlined style={{ transform: 'scale(0.7)' }} /> Vis alle områder
      </Button>

      <div className="mapSummary--selfCenter">
        {polygons?.features.map((feature: Feature<Polygon>, index: number) => (
          <Button
            key={feature.id}
            className={selectedPolygon?.id === feature.id ? 'polygon_map__button' : ''}
            onClick={() => handleSelectedPolygonButton(feature)}
            color="tertiary"
          >
            Område {index + 1}
          </Button>
        ))}
      </div>

      {/*//! The map container */}
      <div style={{ position: 'relative', flexGrow: 1, width: '100%' }}>
        <div ref={container} />
      </div>
    </div>
  ) : (
    <Loader />
  );
};
