import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Row, Button, Input, Space } from "antd";
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
      <div
        style={{
          height: "50px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Input
          type="search"
          placeholder="Search book"
          // onChange={handleSearch}
          style={{ width: "300px", height: "40px" }}
        />

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
