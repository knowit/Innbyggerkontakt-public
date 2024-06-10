import { useEffect, useRef, useState } from 'react';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import { DrawCreateEvent, DrawDeleteEvent, DrawSelectionChangeEvent } from '@mapbox/mapbox-gl-draw';
import { useMap } from 'contexts/MapContext';
import { Button, MapButton } from 'innbyggerkontakt-design-system';
import { ButtonHandler } from './ButtonGroups/ButtonHandler';

import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/DeleteOutline';
import Edit from '@mui/icons-material/Edit';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

import './PolygonMap.scss';
import { Loader } from 'components';

type Props = {
  polygons: FeatureCollection<Polygon>;
  setPolygons: (polygons: FeatureCollection<Polygon>) => void;
};

export const PolygonMap = ({ polygons, setPolygons }: Props) => {
  //! The context from the map provider
  const {
    map,
    mapIsReady,

    draw,

    isFullscreen,

    injectMapToContainer,
    setDrawMode,

    setFullscreen,
    setInteractive,

    focusOnPolygon,
    focusOnPolygons,
    goToOrigin,

    resetMap,
  } = useMap();

  const container = useRef<HTMLDivElement | null>(null);

  const [selectedPolygon, setSelectedPolygon] = useState<Feature<Polygon> | undefined>(undefined);
  const [showAll, setShowAll] = useState(true);
  const [showMap, setShowMap] = useState(false);

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

  //! Executes when the polygons or fullscreen changes, to update listeners
  useEffect(() => {
    if (mapIsReady && map.current) {
      addListeners();
    }
    return () => {
      removeListeners();
    };
  }, [polygons, isFullscreen]);

  //! Updating states according to fullscreen changes
  useEffect(() => {
    !isFullscreen ? setDrawMode('simple_select') : null;
    isFullscreen ? setShowMap(true) : null;
  }, [isFullscreen]);

  //! Sets focus and selection on changes to showAll state
  useEffect(() => {
    if (showAll && polygons && polygons.features.length > 0 && mapIsReady && !isFullscreen) {
      setSelectedPolygon(undefined);
      setTimeout(() => focusOnPolygons(polygons), 0);
    }
  }, [showAll, polygons]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  //! Collection of listeners to be added to the map
  const addListeners = () => {
    map.current?.on('draw.create', drawListener);
    map.current?.on('draw.update', drawListener);
    map.current?.on('draw.selectionchange', selectionListener);
    map.current?.on('draw.delete', deleteListener);
  };

  const removeListeners = () => {
    map.current?.off('draw.create', drawListener);
    map.current?.off('draw.update', drawListener);
    map.current?.off('draw.selectionchange', selectionListener);
    map.current?.off('draw.delete', deleteListener);
  };

  const drawListener = (e: DrawCreateEvent) => {
    const polygon = e.features[0] as Feature<Polygon>;
    const index = polygons?.features.findIndex((p) => p.id === polygon.id);
    if (index === -1 || index === undefined) {
      polygons?.features.push(polygon);
      setPolygons(polygons);
      setSelectedPolygon(polygon);
    } else if (index > -1) {
      polygons?.features.splice(index, 1, polygon);
      setPolygons(polygons);
    }
  };

  const deleteListener = (e: DrawDeleteEvent) => {
    if (e.features.length > 0) {
      const polygon = e.features[0] as Feature<Polygon>;
      handleDeletePolygon(polygon);
    }
  };

  const selectionListener = (e: DrawSelectionChangeEvent) => {
    if (e.features.length > 0) {
      const polygon = e.features[0] as Feature<Polygon>;
      setSelectedPolygon(polygon);
    } else {
      setSelectedPolygon(undefined);
    }
    if (!isFullscreen) {
      setDrawMode('simple_select');
    }
  };

  //! Handlers for button presses or events
  const handleDeletePolygon = (polygon: Feature<Polygon>) => {
    const index = polygons?.features.findIndex((p) => p.id === polygon.id);
    if (index !== undefined && index !== -1) {
      polygons?.features.splice(index, 1);
      setPolygons({ ...polygons });
      setSelectedPolygon(undefined);
      draw.current?.delete(polygon.id as string);
    }
  };

  const handleSelectedPolygonButton = (polygon: Feature<Polygon>) => {
    setSelectedPolygon(polygon);
    setShowAll(false);
    focusOnPolygon(polygon);
  };

  const handleAddPolygonButton = () => {
    setDrawMode('simple_select');
    window.scrollTo(0, 0);
    setFullscreen(true);
  };

  const handleEditPolygonButton = () => {
    if (selectedPolygon) {
      setDrawMode('direct_select', selectedPolygon.id as string);
      window.scrollTo(0, 0);
      setFullscreen(true);
    }
  };

  const handleShowAllButton = () => {
    setShowAll(true);
    polygons.features.length > 0 && focusOnPolygons(polygons);
  };

  const handleAddFirstAreaButton = () => {
    setFullscreen(true);
    setShowMap(true);
    setTimeout(() => {
      goToOrigin();
    }, 0);
  };

  const handleBackCallback = () => {
    setShowMap(false);
    setTimeout(() => {
      if (polygons.features.length > 0) handleShowAllButton();
      else goToOrigin();
    }, 0);
  };

  return mapIsReady ? (
    <div className="recipientItemContent" style={{ textAlign: 'center' }}>
      {polygons && polygons.features.length > 0 ? null : (
        <MapButton color="secondary" onClick={handleAddFirstAreaButton}>
          <Add />
          Lag område i kart
        </MapButton>
      )}
      <div
        className={`polygonMap ${polygons.features.length > 0 || showMap ? '' : 'polygonMap__hidden'} ${
          isFullscreen ? 'polygonMap__fullscreen' : ''
        }`}
      >
        <Button
          variant="rounded"
          color="tertiary"
          svg={[14, 16]}
          className={`polygonMap--selfCenter ${showAll ? 'polygon_map__button' : ''}`}
          onClick={handleShowAllButton}
        >
          <VisibilityOutlined style={{ transform: 'scale(0.7)' }} /> Vis alle områder
        </Button>

        <div className="polygonMap--selfCenter">
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
        <div className="polygonMap__map--background">
          <div ref={container} className={`polygonMap__map ${!isFullscreen ? 'relative' : 'static'}`} />
        </div>

        <div className="polygonMap__buttons">
          <MapButton color="secondary" onClick={selectedPolygon ? handleEditPolygonButton : handleAddPolygonButton}>
            <Edit />
            {selectedPolygon ? 'Rediger område' : 'Legg til område'}
          </MapButton>
          <MapButton
            color="tertiary"
            disabled={!selectedPolygon}
            onClick={() => selectedPolygon && handleDeletePolygon(selectedPolygon)}
          >
            <Delete /> Slett
          </MapButton>
        </div>

        {isFullscreen /* TO SHOW FULLSCREEN BUTTONS */ ? (
          <ButtonHandler
            key={polygons.features.length}
            selectedPolygon={selectedPolygon}
            setSelectedPolygon={setSelectedPolygon}
            backCallback={handleBackCallback}
            polygons={polygons}
          />
        ) : null}
      </div>
    </div>
  ) : (
    <>
      {loading && <Loader />}
      {!loading && <div className="polygonMap__error">Kunne ikke hente kart.</div>}
    </>
  );
};
