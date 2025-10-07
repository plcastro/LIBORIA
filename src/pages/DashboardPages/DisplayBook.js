import React, { useState } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";

const DisplayBook = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const onSearch = () => {
    console.log("Searching:", searchValue);
  };

  return (
    <>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: 290,
              height: 40,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #d9d9d9",
            }}
          >
            <Input
              placeholder="Search Book"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{
                flex: 1,
                height: "100%",
                fontSize: 14,
                borderRadius: 0,
              }}
              onPressEnter={onSearch}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={onSearch}
              style={{
                height: "100%",
                border: "none",
                borderRadius: 0,
                backgroundColor: "#04011cff",
                width: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                lineHeight: "normal",
              }}
            />
          </div>
        </Col>

        <Col>
          <Button
            style={{
              background: "#2808f9ff",
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

      <Row>
        <h2 style={{ marginTop: 20 }}>Trending Books</h2>
      </Row>

      <AddBookModal modal2Open={modalOpen} setModal2Open={setModalOpen} />
    </>
  );
};

export default DisplayBook;
