import { Input } from 'components';
import { forwardRef } from 'react';
import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';
interface Props {
  errorMessage?: string;
}

const NameForm = forwardRef<HTMLInputElement, Props>(({ errorMessage, ...props }, ref) => {
  return (
    <CreateNewTemplate
      title="Navngi"
      subtitle="Gi meldingen du lager et navn til bruk i systemet, sånn at du finner den igjen i oversiktene. E-posten vil lagres automatisk som kladd fra nå."
    >
      <div className="start__input start--margin">
        <Input
          id={'name'}
          title={'Gi et navn til meldingen'}
          type={'text'}
          className="start__input--margin"
          errorMessage={errorMessage}
          inputRef={ref}
          {...props}
        />
      </div>
    </CreateNewTemplate>
  );
});

NameForm.displayName = 'NameForm';
export default NameForm;
