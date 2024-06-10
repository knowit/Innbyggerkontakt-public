import { Route, Routes } from 'react-router';
import { RoutesType } from './utils';

type Props = {
  typeRoute: RoutesType[];
};

const CreateNewRoutes = (props: Props) => {
  return (
    <Routes>
      {props.typeRoute.map((route, index) => (
        <Route key={`${index}`} path={`${route.path}`} element={route.component} />
      ))}
    </Routes>
  );
};

export default CreateNewRoutes;
