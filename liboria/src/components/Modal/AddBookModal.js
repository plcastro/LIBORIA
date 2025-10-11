import React, { useState } from "react";
import {
  Input,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Col,
  Row,
  message,
  Button,
  Space,
} from "antd";

const { TextArea } = Input;

const AddBookModal = ({ modal2Open, setModal2Open }) => {
  const [form] = Form.useForm();
  const [bookData, setBookData] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const handleAddClick = async () => {
    try {
      const values = await form.validateFields();
      console.log("Validated form values:", values);

      setBookData(values);

      setIsConfirmOpen(true);
    } catch (err) {
      message.warning("Please fill out all required fields before proceeding.");
    }
  };

  const handleConfirm = () => {
    console.log("Book added:", bookData);
    message.success("Book added successfully!");
    form.resetFields();
    setIsConfirmOpen(false);
    setModal2Open(false);
  };
  const handleDiscard = () => {
    form.resetFields();
    setModal2Open(false);
    setIsDiscardOpen(false);
    message.info("Book entry discarded.");
  };

  return (
    <>
      <Modal
        title="ADD BOOK DETAILS"
        centered
        open={modal2Open}
        maskClosable={false} // disable click outside
        keyboard={false}
        footer={[
          <Button
            key="Discard"
            onClick={() => {
              setIsDiscardOpen(true);
            }}
          >
            Discard
          </Button>,
          <Button
            key="Add"
            type="primary"
            onClick={handleAddClick}
            style={{ backgroundColor: "#000", color: "#fff" }}
          >
            Add Book
          </Button>,
        ]}
        onCancel={() => {
          form.resetFields();
          setModal2Open(false);
        }}
        width={800}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 15 }}
          layout="horizontal"
          labelAlign="left"
          initialValues={{ totalCopies: 1 }}
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                label="Image"
                name="image"
                rules={[
                  { required: true, message: "Please enter the image url" },
                ]}
              >
                <Input placeholder="Enter Image URL" />
              </Form.Item>
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  { required: true, message: "Please enter the book title" },
                ]}
              >
                <Input placeholder="Enter Book Title" />
              </Form.Item>
              <Form.Item
                label="Author"
                name="author"
                rules={[
                  { required: true, message: "Please enter the author name" },
                ]}
              >
                <Input placeholder="Enter Author Name" />
              </Form.Item>
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  { required: true, message: "Please enter the book category" },
                ]}
              >
                <Input placeholder="Enter Book Category" />
              </Form.Item>
              <Form.Item
                label="Published Date"
                name="publishedDate"
                rules={[
                  { required: true, message: "Please select a published date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Total Copies"
                name="totalCopies"
                rules={[
                  { required: true, message: "Please enter total copies" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Book Description" name="description">
                <TextArea rows={4} placeholder="Enter Book Description" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        title="Confirm Book Details"
        open={isConfirmOpen}
        centered
        footer={[
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Space>
              <Button
                onClick={() => setIsConfirmOpen(false)}
                style={{ width: 200 }}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleConfirm}
                style={{
                  width: 200,
                  backgroundColor: "#000",
                  color: "#fff",
                  borderColor: "#000",
                }}
              >
                Confirm
              </Button>
            </Space>
          </div>,
        ]}
      >
        {bookData ? (
          <div>
            {bookData.image && (
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <img
                  src={bookData.image}
                  alt={bookData.title || "Book Image"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <p>
              <strong>Title:</strong> {bookData.title}
            </p>
            <p>
              <strong>Author:</strong> {bookData.author}
            </p>
            <p>
              <strong>Category:</strong> {bookData.category}
            </p>
            <p>
              <strong>Published Date:</strong>{" "}
              {bookData.publishedDate?.format("YYYY-MM-DD")}
            </p>
            <p>
              <strong>Total Copies:</strong> {bookData.totalCopies}
            </p>
            <p>
              <strong>Description:</strong> {bookData.description}
            </p>
          </div>
        ) : (
          <p>No book data to confirm.</p>
        )}
      </Modal>

      <Modal
        title="Discard Book Entry"
        open={isDiscardOpen}
        onCancel={() => setIsDiscardOpen(false)}
        footer={null}
        centered
      >
        <p>
          Are you sure you want to discard this book? All unsaved details will
          be lost.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Button onClick={() => setIsDiscardOpen(false)}>No</Button>
          <Button type="primary" danger onClick={handleDiscard}>
            Yes, Discard
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AddBookModal;
