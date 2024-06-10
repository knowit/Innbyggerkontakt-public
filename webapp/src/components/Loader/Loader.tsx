import './Loader.scss';

export const Loader: React.FC<React.InputHTMLAttributes<HTMLDivElement>> = (props) => (
  <div className="loader" {...props}>
    <svg className="spinner">
      <circle className="path" fill="none" strokeWidth={6} strokeLinecap="round" r={30} cx={33} cy={33} />
    </svg>
  </div>
);

export default Loader;
