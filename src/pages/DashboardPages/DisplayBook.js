import React, { useState } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";

const { Search } = Input;

const DisplayBook = () => {
  const onSearch = (value, _e, info) => console.log(info?.source, value);
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Row justify={"space-between"}>
        <Col>
          <Search
            placeholder="Search Book"
            onSearch={onSearch}
            style={{ width: 400 }}
            enterButton={
              <Button
                icon={
                  <SearchOutlined style={{ fontSize: 16, color: "#fff" }} />
                }
                style={{ width: 100, backgroundColor: "#04011cff" }} //
              />
            }
          />
        </Col>

        <Col>
          <Button
            style={{ background: "#2808f9ff", color: "#fff", width: 200 }}
            icon={<PlusOutlined style={{ fontSize: 16, color: "#ffffffff" }} />}
            onClick={() => setModalOpen(true)}
          >
            Add Book
          </Button>
        </Col>
      </Row>
      <Row>
        <h2>Trending Books</h2>
      </Row>
      <AddBookModal modal2Open={modalOpen} setModal2Open={setModalOpen} />
    </>
  );
};

export default DisplayBook;
