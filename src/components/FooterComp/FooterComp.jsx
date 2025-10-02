import React from "react";
import "./FooterComp.css";
import logo_light from "../../assets/liboria white.png";

const FooterComp = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-left">
          <img src={logo_light} alt="Liboria Logo" className="footer-logo" />
          <p>
            Discover, read, and enjoy books <br />
            anywhere life takes you.
          </p>
        </div>

        <div className="footer-right">
          <p>
            <strong>PHONE:</strong> +63 09564569912
          </p>
          <p>
            <strong>EMAIL:</strong> liboria@gmail.com
          </p>
          <p>
            <strong>ADDRESS:</strong> Coral Way, Pasay City
          </p>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>©2025 Liboria. All rights reserved.</p>
      </div>
    </footer>
  );
};
export default FooterComp;
