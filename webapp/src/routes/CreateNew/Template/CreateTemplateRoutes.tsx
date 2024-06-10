import { Route, Routes } from 'react-router';
import { RoutesType } from '../Bulletin/utils';

type Props = {
  routes: RoutesType[];
};

export const CreateTemplateRotues = (props: Props) => {
  return (
    <Routes>
      {props.routes.map((route, index) => (
        <Route key={`${index}`} path={`${route.path}`} element={route.component} />
      ))}
    </Routes>
  );
};
