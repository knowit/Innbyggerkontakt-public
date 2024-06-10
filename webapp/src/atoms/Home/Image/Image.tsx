import firebase from 'firebase/compat/app';
import './Image.scss';

interface Props {
  content: firebase.firestore.DocumentData;
  className?: string;
  classNamePlaceholder?: string;
}

export const Image: React.FC<Props> = ({ content, className, classNamePlaceholder }) => {
  return (
    <>
      {content &&
      content.contentInLanguage[0] &&
      content.contentInLanguage[0].variables?.bilde &&
      content.contentInLanguage[0].variables?.bilde !== 'NO_IMAGE' ? (
        <img
          alt={content.contentInLanguage[0].variables.altText}
          src={content.contentInLanguage[0].variables.bilde}
          className={className}
        />
      ) : (
        <svg className={classNamePlaceholder}>
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fillText">
            E-posten er uten bilde
          </text>
        </svg>
      )}
    </>
  );
};

export default Image;
