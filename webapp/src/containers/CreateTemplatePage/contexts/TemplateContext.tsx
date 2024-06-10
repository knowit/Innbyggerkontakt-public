import { createContext, ReactNode, useContext, useState } from 'react';
import { Template, TemplateContextType } from '../../../models';

const TemplateContext = createContext<TemplateContextType>({} as TemplateContextType);

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const [template, setTemplateState] = useState<Template | null>({
    id: undefined,
    name: undefined,
    orgId: undefined,
    description: undefined,
    recipientDescription: undefined,
    contentArray: [],
    tags: [],
  });

  const clearTemplate = () => {
    setTemplateState(null);
  };

  const setValues = (values: Template) => {
    setTemplateState((prev) => ({ ...prev, ...values }));
  };

  return <TemplateContext.Provider value={{ template, clearTemplate, setValues }}>{children}</TemplateContext.Provider>;
};

export const useTemplate = () => {
  return useContext(TemplateContext);
};
