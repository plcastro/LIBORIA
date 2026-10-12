
import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  InputNumber,
  message,
  Form,
  DatePicker,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";

const EditBookModal = ({ modalOpen, setModalOpen, book, onBookUpdated }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalOpen && book) {
      form.setFieldsValue({
        title: book.title,
        author_name: book.author_name,
        category: book.category,
        published_date: book.published_date
          ? dayjs(book.published_date)
          : null,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
        description: book.description,
        image: book.image,
      });
    } else if (!modalOpen) {
      form.resetFields();
    }
  }, [modalOpen, book, form]);

  const handleOk = async () => {
    if (!book?.book_id) {
      messageApi.error("No book selected to update.");
      return;
    }

    let values;

    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...values,
        total_copies: Number(values.total_copies),
        available_copies: Number(values.available_copies),
        published_date: values.published_date
          ? values.published_date.format("YYYY-MM-DD")
          : null,
      };

      await axios.put(
        `http://localhost:8000/api/books/${book.book_id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (onBookUpdated) {
        onBookUpdated({ ...book, ...payload });
      }

      setModalOpen(false);
      messageApi.success("Book updated successfully");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Error updating book:", err);

      messageApi.error(
        err.response?.data?.error || "Failed to update book"
      );
    } finally {
      setLoading(false);
    }
  };

  // Preserve the existing rule for books that are currently borrowed.
  const handleTotalCopiesChange = (value) => {
    if (value == null || !book) return;

    const currentTotal = book.total_copies;
    const currentAvailable = book.available_copies;
    const borrowedCount = currentTotal - currentAvailable;

    if (borrowedCount > 0 && value < currentTotal) {
      messageApi.warning(
        "You cannot decrease total copies while some books are still borrowed."
      );

      form.setFieldsValue({ total_copies: currentTotal });
      return;
    }

    const available = form.getFieldValue("available_copies") || 0;

    if (value < available) {
      form.setFieldsValue({ available_copies: value });
    }
  };

  return (
    <>
      {contextHolder}

      <Modal
        title="Edit Book"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="Save"
        confirmLoading={loading}
        width={600}
        centered
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Image URL" name="image">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please enter the title." }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Author Name"
                name="author_name"
                rules={[
                  { required: true, message: "Please enter the author name." },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  { required: true, message: "Please enter the category." },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Published Date" name="published_date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Total Copies"
                name="total_copies"
                rules={[
                  { required: true, message: "Enter the total copies." },
                  {
                    type: "number",
                    min: 1,
                    message: "Total copies must be at least 1.",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const available = getFieldValue("available_copies") || 0;

                      if (value == null || value >= available) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error(
                          "Total copies cannot be less than available copies."
                        )
                      );
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  style={{ width: "100%" }}
                  onChange={handleTotalCopiesChange}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Available Copies"
                name="available_copies"
                rules={[
                  { required: true, message: "Enter available copies." },
                  {
                    type: "number",
                    min: 0,
                    message: "Available copies cannot be negative.",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue("total_copies") || 0;

                      if (value == null || value <= total) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error(
                          "Available copies cannot exceed total copies."
                        )
                      );
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  precision={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditBookModal;