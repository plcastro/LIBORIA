import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Row, Button, Input, Col } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";
import axios from "axios";
const { Search } = Input;
const onSearch = (value, _e, info) => console.log(info?.source, value);
const DisplayBook = () => {
  const [modalOpen, setModalOpen] = useState(false);
  // useEffect(() => {
  //   axios;
  // });
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Row
          gutter={[16, 16]}
          style={{
            display: "flex",
            alignContent: "baseline",
            justifyContent: "space-between",
          }}
        >
          {/* Search Input */}
          <Col xs={24} sm={24} md={6} lg={6}>
            <Input
              type="search"
              placeholder="Search book"
              // onChange={handleSearch}
              style={{ maxWidth: "300px", width: "100%", height: "40px" }}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={6}
            lg={6}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              type="primary"
              style={{
                backgroundColor: "#1600a3ff",
                color: "#fff",
                width: 200,
                height: 40,
                fontWeight: 500,
              }}
              icon={<PlusOutlined style={{ fontSize: 16, color: "#fff" }} />}
              onClick={() => setModalOpen(true)}
            >
              Add Book
            </Button>
          </Col>
        </Row>
      </div>

      <Row>
        <h2 style={{ marginTop: 20 }}>Trending Books</h2>
      </Row>
      <Row>{/* Mapping ng books */}</Row>

      <AddBookModal modal2Open={modalOpen} setModal2Open={setModalOpen} />
    </>
  );
};

export default DisplayBook;
