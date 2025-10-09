import React, { useState } from "react";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Row, Col, Button } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";

const DisplayBook = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const onSearch = (value) => {
    console.log("Searching:", value);
  };

  return (
    <>
      <Row
        gutter={[16, 16]}
        justify="space-between"
        align="middle"
        style={{ width: "100%", marginBottom: "24px" }}
      >
        <Col flex="auto" className="max-w-xl">
          <div style={{ maxWidth: "300px" }}>
            <input
              type="text"
              placeholder="Search Book, Author..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
              style={{ minHeight: "40px" }}
            />

            <button
              onClick={onSearch}
              style={{ width: "40px", height: "40px" }}
              aria-label="Maghanap"
            >
              <SearchOutlined style={{ fontSize: "16px", color: "#fff" }} />
            </button>
          </div>
        </Col>

        <Col>
          <Button
            type="primary"
            style={{
              backgroundColor: "#2808f9ff",
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
