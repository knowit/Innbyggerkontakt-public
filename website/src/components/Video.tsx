import React from 'react';

interface Props {
  videoSrcURL: string;
  videoTitle: string;
  className: string;
}

const Video: React.FC<Props> = ({ videoSrcURL, videoTitle, className }: Props) => (
  <div className={className}>
    <iframe
      width="100%"
      height="100%"
      src={videoSrcURL}
      title={videoTitle}
      allow="accelerometer; autoplay; encrypted-media; gyroscope"
      frameBorder="0"
      // webkitallowfullscreen="true"
      // mozallowfullscreen="true"
      allowFullScreen={true}
    />
  </div>
);
export default Video;
