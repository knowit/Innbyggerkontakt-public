import DOMpurify from 'dompurify';
import root from 'react-shadow';
import './PreviewContainer.scss';

interface Props {
  html: string;
  className?: string;
}

const PreviewDesktop: React.FC<Props> = ({ html, className }) => {
  return (
    <div className={`${className} previewContainer__desktopPreview`}>
      <root.div mode="closed">
        <div dangerouslySetInnerHTML={{ __html: DOMpurify.sanitize(html) }} />
      </root.div>
    </div>
  );
};

export default PreviewDesktop;
