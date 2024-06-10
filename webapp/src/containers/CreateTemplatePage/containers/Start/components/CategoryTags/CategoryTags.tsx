import { FilterGroup } from 'innbyggerkontakt-design-system';
import { ReactNode, useEffect, useState } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { FormWrapper } from '../../../../../../components';
import { CategoryTagNames, FieldWrapperProps } from '../../../../../../models';

import './CategoryTags.scss';

export interface CategoryComponent extends FieldWrapperProps {
  id?: string;
  className?: string;
  defaultValue?: string[];
  style?: React.CSSProperties | undefined;
  rules?: RegisterOptions;
  labelIcon?: ReactNode;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (...event: any[]) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

const CategoryTags: React.FC<CategoryComponent> = ({
  className,
  style,
  disabled = false,
  info,
  mandatory,
  title,
  showTitle = true,
  titleComponent,
  additionalTitleClassName,
  defaultValue,
  id,
  errorMessage,
  labelIcon,
  onChange,
}: CategoryComponent) => {
  const [toggled, setToggled] = useState<string[]>(defaultValue || []);
  useEffect(() => {
    onChange && onChange(toggled);
  }, [toggled]);

  return (
    <div className={`inputFieldComponent ${className || ''}`} style={style}>
      <FormWrapper
        labelForId={id}
        errorMessage={errorMessage}
        title={title}
        mandatory={mandatory}
        info={info}
        showTitle={showTitle}
        disabled={disabled}
        icon={labelIcon}
        titleComponent={titleComponent}
        additionalTitleClassName={additionalTitleClassName}
      >
        <div className="categoryTagsContainer">
          <FilterGroup options={Object.values(CategoryTagNames)} toggled={defaultValue ?? []} setToggled={setToggled} />
        </div>
      </FormWrapper>
    </div>
  );
};

export default CategoryTags;
