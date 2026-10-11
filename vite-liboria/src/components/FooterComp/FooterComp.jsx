import React from "react";
import logo_light from "../../assets/liboria white.png";

const FooterComp = () => {
  return (
    <footer
      className="footer"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
        gap: "24px",
        alignItems: "start",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div>
        <img
          src={logo_light}
          alt="Liboria Logo"
          style={{
            width: "200px",
            maxWidth: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />

        <p style={{ fontSize: "14px", lineHeight: 1.6, marginTop: "20px" }}>
          Discover, read, and enjoy books
          <br />
          anywhere life takes you.
        </p>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ margin: "40px 0 0 0" }}>
          <p style={{ fontSize: "14px" }}>
            <strong>PHONE:</strong> +63 09564569912
          </p>

          <p style={{ fontSize: "14px", overflowWrap: "anywhere" }}>
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

      <div
        style={{
          gridColumn: "1 / -1",
          borderTop: "1px solid rgba(255,255,255,0.5)",
          paddingTop: "16px",
        }}
      >
        <p>©2026 Liboria. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterComp;
