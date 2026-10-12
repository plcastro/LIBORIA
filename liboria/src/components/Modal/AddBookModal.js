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
  Select,
} from "antd";
import axios from "axios";
const { TextArea } = Input;
const AddBookModal = ({ modal2Open, setModal2Open, onBookCreated }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [bookData, setBookData] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const handleAddClick = async () => {
    try {
      const values = await form.validateFields();
      console.log("Validated form values:", values);

      const normalizedData = {
        title: values.title,
        author_name: values.author,
        category: values.category,
        published_date: values.published_date
          ? values.published_date.format("YYYY-MM-DD")
          : null,
        total_copies: values.total_copies,
        available_copies: values.total_copies,
        description: values.description,
        image: values.image,
      };

      setBookData(normalizedData);
      setIsConfirmOpen(true);
    } catch (err) {
      console.error(err);
      messageApi.error(err.message || "Failed to add book");
    }
  };

  
const handleConfirm = async () => {
  try {
    if (!bookData) return;

    await axios.post("http://localhost:8000/api/books", bookData, {
      headers: { "Content-Type": "application/json" },
    });

    form.resetFields();
    setBookData(null);
    setIsConfirmOpen(false);
    setModal2Open(false);

    if (onBookCreated) onBookCreated();

    messageApi.success("Book added successfully");

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    console.error(err);
    messageApi.error(
      err.response?.data?.error || err.message || "Failed to add book"
    );
  }
};

  const handleDiscard = () => {
    form.resetFields();
    setModal2Open(false);
    setIsDiscardOpen(false);
    messageApi.info("Book entry discarded.");
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="ADD BOOK DETAILS"
        centered
        open={modal2Open}
        closable={false}
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
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          labelAlign="left"
          initialValues={{ total_copies: 1 }}
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} sm={12}>
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
                  {
                    required: true,
                    message: "Please select the book category",
                  },
                ]}
              >
                <Select
                  placeholder="Select category:"
                  defaultValue="Trending"
                  options={[
                    { value: "Trending", label: "Trending" },
                    { value: "Romance", label: "Romance" },
                    { value: "Kids", label: "Kids" },
                    { value: "Thriller", label: "Thriller" },
                    { value: "Textbooks", label: "Textbooks" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Right Column */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Published Date"
                name="published_date"
                rules={[
                  { required: true, message: "Please select a published date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Total Copies" name="total_copies">
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
                key="confirm"
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
              <strong>Author:</strong> {bookData.author_name}
            </p>
            <p>
              <strong>Category:</strong> {bookData.category}
            </p>
            <p>
              <strong>Published Date:</strong> {bookData.published_date}
            </p>
            <p>
              <strong>Total Copies:</strong> {bookData.total_copies}
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
