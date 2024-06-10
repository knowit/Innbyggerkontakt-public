import './PopUpButton.scss';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tull?: string;
}

const PopUpButton = (props: Props) => <button className="popUpButton" {...props}></button>;

export default PopUpButton;
