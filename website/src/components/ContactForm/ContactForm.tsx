// import React, { useState } from 'react';
import React from 'react';
import Button from '../Buttons/Button';
import './ContactForm.scss';
import MailImage from '../../images/mail.svg';
// import axios from 'axios';

export const ContactForm: React.FC = () => {
  // const [email, setEmail] = useState<string>("");

  // const handleChange = (event) => {
  //     console.log(event.target.value)
  //     setEmail(event.target.value)

  // }

  // const handleSubmit = (e) => {
  //     // valider
  //     e.preventDefault()
  //     console.log("submit - email", email)
  //     setEmail("");
  //     // popup som sier at den ble sendt?

  // }

  // const [serverState, setServerState] = useState({
  //   submitting: false,
  //   status: null,
  // });
  // const handleServerResponse = (ok, msg, form) => {
  //   setServerState({
  //     submitting: false,
  //     status: { ok, msg },
  //   });
  //   if (ok) {
  //     form.reset();
  //   }
  // };
  // const handleOnSubmit = (e) => {
  //   e.preventDefault();
  //   const form = e.target;
  //   setServerState({ submitting: true, status: null });
  //   axios({
  //     method: 'post',
  //     url: 'https://getform.io/f/1efa4f76-fd34-4128-9f0d-48eb4112df38',
  //     data: new FormData(form),
  //   })
  //     .then((r) => {
  //       handleServerResponse(true, 'Thanks!', form);
  //     })
  //     .catch((r) => {
  //       handleServerResponse(false, r.response.data.error, form);
  //     });
  // };

  return (
    <div className="contactFormContainer">
      <div className="contactFormContent">
        <img className="formMailImage" src={MailImage} alt="Person mottar mail" />
        {/* <form className="informationTextContainer" onSubmit={handleSubmit}> */}
        {/* <form className="informationTextContainer" onSubmit={handleOnSubmit}> */}
        <form className="informationTextContainer">
          <label htmlFor="emailInput" className="contactFormDescription">
            Skriv inn <b>e-posten</b> din her, så vil du bli kontaktet av teamet vårt
            <input type="email" id="emailInput" placeholder="Skriv inn epost" name="emailInput" />
          </label>
          {/* //value={email} onChange={handleChange}/> */}
          <div className="disclaimerText">
            Dette er ikke en forpliktende avtale. Vi vil gi deg all informasjon og svare på alle spøsrmål du måtte lure
            på.
          </div>
          <Button className="submitButton" type="submit">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
