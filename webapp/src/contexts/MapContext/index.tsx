import { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react';
import { Feature, Polygon, FeatureCollection } from 'geojson';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import { useUser } from 'hooks';
import { addWorldLayer, Coordinates, getBorders, getBounds } from './utils';
import { DrawContextStyling } from './DrawContextStyling';

//? Styling
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './style.css';

//! The interface for the map context
interface MapContextType {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  draw: React.MutableRefObject<MapboxDraw | null>;
  mapContainer: React.RefObject<HTMLDivElement>;
  mapIsReady: boolean;

  drawMode: string | null;

  isFullscreen: boolean;

  injectMapToContainer: (
    container: HTMLElement,
    resizeCallback?: ((...args: unknown[]) => void) | undefined,
    ...args: unknown[]
  ) => void;

  toggleVisible: () => void;
  toggleFullscreen: () => void;
  toggleInteractive: () => void;
  toggleEditing: () => void;

  setFullscreen: (value: boolean) => void;
  setEditing: (value: boolean) => void;
  setInteractive: (value: boolean) => void;

  setDrawMode: (mode: MapboxDraw.DrawMode, featureId?: string) => void;

  addPolygon: (polygon: Feature<Polygon>) => void;
  addPolygons: (polygon: FeatureCollection<Polygon>) => void;

  focusOnPolygon: (polygon: Feature<Polygon>, animate?: boolean) => void;
  focusOnPolygons: (polygons: FeatureCollection<Polygon>, animate?: boolean) => void;
  goToOrigin: (animate?: boolean) => void;

  resetMap: () => void;
}

export const MapContext = createContext<MapContextType>({} as MapContextType);

interface MapProviderProps {
  children: ReactNode | ReactNode[];
}

export const MapProvider: React.FC<MapProviderProps> = (props) => {
  const { organization } = useUser();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [borders, setBorders] = useState<Coordinates>([]);

  const [mapIsReady, setMapIsReady] = useState<boolean>(false);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [drawMode, setDrawModeState] = useState<MapboxDraw.DrawMode | null>(null);

  const draw = useRef<MapboxDraw | null>(null);
  const navigation = useRef<mapboxgl.NavigationControl | null>(null);
  const geocoder = useRef<MapboxGeocoder | null>(null);

  const toggleVisible = () => setIsVisible((prev) => !prev);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const setFullscreen = (value: boolean) => setIsFullscreen(value);

  const resetMap = () => {
    if (map.current) {
      setEditing(false);
      setInteractive(false);
      setFullscreen(false);
      setIsVisible(false);

      removeAllControllers();
      addAllControllers();

      setTimeout(() => goToOrigin(false), 0);
    }
  };

  //! On mount, get borders based on organization
  useEffect(() => {
    if (organization?.municipalityNumber) {
      getBorders(organization.municipalityNumber).then((coords) => setBorders(coords));
    }
  }, [organization]);

  //! When border is loaded, setting up the map and change state to ready
  useEffect(() => {
    if (borders.length > 0 && mapContainer.current) {
      //! Assigning the token to the mapboxgl object
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

      //! Creating the map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/innbyggerkontakt/claqrw825006t15p6pedscel6', //'mapbox://styles/innbyggerkontakt/cl9sbqz40000u14o42dq8ixzx',
        zoom: 5,
        projection: { name: 'mercator' },
        interactive: false,
        renderWorldCopies: false,
      });

      map.current.on('style.load', () => {
        goToOrigin(false);
      });

      map.current?.on('load', () => {
        //! Creating controllers
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          styles: DrawContextStyling,
          userProperties: true,
        });
        navigation.current = new mapboxgl.NavigationControl({ showCompass: false });
        geocoder.current = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          collapsed: true,
        });

        //! Adding world layer and mounting controllers
        map.current ? addWorldLayer(map.current, borders) : null;
        addAllControllers();

        //! Listener for mode change
        map.current?.on('draw.modechange', (e) => setDrawModeState(e.mode));

        //! Setting the map's state to ready
        setMapIsReady(true);
      });
    }
  }, [borders]);

  //! Resize map when set to fullscreen or visibility changes
  useEffect(() => {
    if (map.current) {
      map.current.resize();
    }
  }, [isFullscreen, isVisible]);

  //! When interactivity changes
  useEffect(() => {
    if (map.current) {
      if (isInteractive) {
        map.current.dragPan.enable();
        map.current.scrollZoom.enable();
      } else {
        map.current.dragPan.disable();
        map.current.scrollZoom.disable();
      }
    }
  }, [isInteractive]);

  //! When editing changes
  useEffect(() => {
    if (map.current) {
      //! ALLOW DRAWING END EDITING OF POLYGONS
      if (isEditing) addAllControllers();
      else removeAllControllers();
    }
  }, [isEditing]);

  //! Function to help inc
  const injectMapToContainer = (
    container: HTMLElement,
    resizeCallback?: (...args: unknown[]) => void,
    args?: unknown,
  ) => {
    if (mapContainer.current) {
      container.appendChild(mapContainer.current);

      map.current?.once('resize', () => {
        resizeCallback ? resizeCallback(args) : goToOrigin();
      });

      map.current?.resize();
      setIsVisible(true);
    }
  };

  //! Polygon functions
  const addPolygon = (polygon: Feature<Polygon>) => {
    if (map.current && draw.current && map.current.hasControl(draw.current)) {
      draw.current?.add(polygon);
    }
  };
  const addPolygons = (polygons: FeatureCollection<Polygon>) => {
    if (map.current && draw.current && map.current.hasControl(draw.current)) {
      draw.current?.add(polygons);
    }
  };

  const focusOnPolygon = (polygon: Feature<Polygon>, animate = true) => {
    if (map.current && draw.current && map.current.hasControl(draw.current)) {
      const p = draw.current.get(polygon.id as string);
      if (!p) addPolygon(polygon);
      map.current.fitBounds(getBounds(polygon.geometry.coordinates), { padding: 50, animate });
    }
  };

  const focusOnPolygons = (polygons: FeatureCollection<Polygon>, animate = true) => {
    if (map.current && draw.current && map.current.hasControl(draw.current)) {
      draw.current?.add(polygons);
      const coords = [polygons.features?.map((f) => f.geometry.coordinates[0])].map((c) => c.flat(1));
      map.current.fitBounds(getBounds(coords), { padding: 50, animate });
    }
  };

  const goToOrigin = (animate = true) => {
    if (map.current && borders.length > 0) {
      map.current?.fitBounds(getBounds(borders), { padding: 50, animate });
    }
  };

  const setDrawMode = (mode: MapboxDraw.DrawMode, featureId?: string) => {
    if (featureId) {
      if (mode === 'simple_select') {
        draw.current?.changeMode(mode as string, { featureIds: [featureId] });
      } else {
        draw.current?.changeMode(mode as string, { featureId });
      }
    } else draw.current?.changeMode(mode as string);
  };

  //! Function to toggle interactivity
  const setInteractive = (value: boolean) => setIsInteractive(value);
  const toggleInteractive = () => setIsInteractive((prev) => !prev);

  //! Function to toggle an editing mode
  const setEditing = (value: boolean) => setIsEditing(value);
  const toggleEditing = () => setIsEditing((prev) => !prev);

  //! Functions to add and remove controllers
  const addAllControllers = () => {
    draw.current ? addController(draw.current) : null;
    geocoder.current ? addController(geocoder.current) : null;
    navigation.current ? addController(navigation.current) : null;
  };
  const removeAllControllers = () => {
    draw.current ? removeController(draw.current) : null;
    geocoder.current ? removeController(geocoder.current) : null;
    navigation.current ? removeController(navigation.current) : null;
  };
  const addController = (controller: mapboxgl.IControl) => {
    map.current?.hasControl(controller) ? null : map.current?.addControl(controller);
  };
  const removeController = (controller: mapboxgl.IControl) => {
    map.current?.hasControl(controller) ? map.current?.removeControl(controller) : null;
  };

  return (
    <MapContext.Provider
      value={{
        mapContainer,
        map,
        draw,
        drawMode,
        mapIsReady,

        isFullscreen,

        injectMapToContainer,

        setDrawMode,

        toggleVisible,
        toggleFullscreen,
        toggleInteractive,
        toggleEditing,

        setFullscreen,
        setEditing,
        setInteractive,

        addPolygon,
        addPolygons,

        focusOnPolygon,
        focusOnPolygons,
        goToOrigin,

        resetMap,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          ...(isVisible ? { display: 'block', pointerEvents: 'auto' } : { display: 'none', pointerEvents: 'none' }),
          ...(isFullscreen
            ? {
                cursor: 'grab',
                top: '5rem',
                height: 'calc(100vh - 5rem)',
                width: '100vw',
                zIndex: 1000,
              }
            : {}),
        }}
        ref={mapContainer}
      />
      {props.children}
    </MapContext.Provider>
  );
};

//! React hook for getting context
export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
