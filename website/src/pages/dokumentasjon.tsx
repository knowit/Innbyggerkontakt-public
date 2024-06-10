import * as React from 'react';
import '../styles/index.scss';
import MainContainer from '../containers/mainContainer/MainContainer';
import DocumentationContainer from '../components/DocumentationContainer/DocumentationContainer';
import { DocumentationPostQuery } from '../components/DocumentationContainer/DocumentationTypes';

interface Props {
  data: DocumentationPostQuery;
}
// markup
const DocumentationPage: React.FC<Props> = () => {
  return (
    <div>
      <MainContainer pagename="Dokumentasjon">
        <DocumentationContainer />
      </MainContainer>
    </div>
  );
};

export default DocumentationPage;
