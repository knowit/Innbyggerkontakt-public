import DOMPurify from 'dompurify';
import { TemplateContent } from 'models';

import './ContentPreview.scss';

type Props = {
  templateContent?: TemplateContent;
};

const ImagePlaceholder = ({ text }: { text: string }) => {
  return (
    <svg style={{ backgroundColor: '#666', height: '60px' }}>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" transform="translate(0 4)" fill="#fff">
        {text}
      </text>
    </svg>
  );
};

const ContentImage = ({ image, image_alt }: { image?: string; image_alt?: string }) => {
  return image ? (
    <img width={'100%'} alt={image_alt} src={image} className="content-summary__image" />
  ) : (
    <svg>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fillText">
        {image_alt ? image_alt : 'E-posten er uten bilde'}
      </text>
    </svg>
  );
};

const ContentPreview = ({ templateContent }: Props) => {
  if (!templateContent) {
    return null;
  }
  return (
    <div className="contentPreviewContainer">
      <div className="contentPreviewPage__content">
        <ImagePlaceholder text="Kommunelogo" />
        <ContentImage image={templateContent.image} image_alt={templateContent.image_alt} />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem', width: '100%', gap: '1rem' }}>
          <h1 style={{ letterSpacing: '10%', padding: '0px 25px 0px 25px', fontSize: '24px' }}>
            {templateContent?.heading}
          </h1>
          <div
            className="contentPreviewImageContainer"
            style={{ textAlign: 'left', letterSpacing: '100%', lineHeight: '16px', fontSize: '13px' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(templateContent?.ingress ?? '') }}
          />
          <div
            className="contentPreviewImageContainer"
            style={{ textAlign: 'left', letterSpacing: '100%', fontSize: '13px' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(templateContent?.content ?? '') }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem', gap: '1rem' }}>
          <div
            className="contentPreviewImageContainer"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(templateContent?.reason ?? '') }}
          />
          <p style={{ marginBottom: '1.5rem' }}>{'Kommunen sin bunntekst'}</p>
        </div>
        <ImagePlaceholder text="Kommunelogo" />
      </div>
    </div>
  );
};

export default ContentPreview;
