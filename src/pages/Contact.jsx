import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import numoabuilding from "../assets/NU MOA building.png";
import "./styles.css";
export const Contact = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="contact-content">
        {/* <Button
          icon={<ArrowLeftOutlined />}
          style={{ border: 0, width: "150px" }}
          onClick={() => navigate("/")}
        >
          Back
        </Button> */}
        <main>
          <h2>CONTACT</h2>
          <img src={numoabuilding} alt="NU MOA Building" width="100%" />
          <p>
            At Liboria, we believe every reader is part of our story. Whether
            you’re looking for your next great read, need help borrowing a book,
            or simply want to share your thoughts, we’re here to listen. Our
            team loves hearing from fellow book lovers—because your ideas,
            questions, and feedback help us grow and make Liboria even better.
            Don’t be shy—drop us a message and let’s keep the love for reading
            alive together!
          </p>
          <br />
          <hr />
          <br />
          <h2>CONTACT US @</h2>
          <p>
            <strong>Email:</strong> liboria@gmail.com <br />
            <strong>Phone:</strong> +63 09564569912 <br />
            <strong>Address:</strong> NU Building, Coral Way Street, Mall of
            Asia Complex, Pasay City 1300
          </p>
          <hr />
        </main>
      </div>
    </div>
  );
};
