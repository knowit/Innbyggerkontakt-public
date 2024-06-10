import DOMpurify from 'dompurify';
import ReactDevicePreview from 'react-device-preview';
import root from 'react-shadow';
import './PreviewContainer.scss';

interface Props {
  html: string;
  className?: string;
}

const PreviewMobile: React.FC<Props> = ({ html, className }) => {
  return (
    <div className={`${className} previewContainer`}>
      <div className="previewContainer__iphoneDevice">
        <ReactDevicePreview device="iphonex" scale="0.8">
          <div className="previewContainer__iphoneScreen">
            <root.div mode="closed">
              <div dangerouslySetInnerHTML={{ __html: DOMpurify.sanitize(html) }} />
            </root.div>
          </div>
        </ReactDevicePreview>
      </div>
    </div>
  );
};

export default PreviewMobile;
