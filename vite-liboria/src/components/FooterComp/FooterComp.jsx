import React from "react";

import logo_light from "../../assets/liboria white.png";

const FooterComp = () => {
  return (
    <footer className="footer">
      <div>
        <img src={logo_light} alt="Liboria Logo" style={{ width: "200px" }} />
      </div>
      <div style={{}}>
        <div style={{ margin: "20px 0" }}>
          <p style={{ fontSize: "14px" }}>
            Discover, read, and enjoy books <br />
            anywhere life takes you.
          </p>
        </div>

        <div style={{ margin: "20px 0" }}>
          <p style={{ fontSize: "14px" }}>
            <strong>PHONE:</strong> +63 09564569912
          </p>
          <p style={{ fontSize: "14px" }}>
            <strong>EMAIL:</strong>{" "}
            <a href="mailto:liboria@gmail.com" style={{ color: "white" }}>
              liboria@gmail.com
            </a>
          </p>
          <p style={{ fontSize: "14px" }}>
            <strong>ADDRESS:</strong> Coral Way, Pasay City
          </p>
        </div>
      </div>

      <hr />

      <div>
        <div style={{ textAlign: "left", fontSize: "14px" }}>
          <p>©2026 Liboria. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterComp;
