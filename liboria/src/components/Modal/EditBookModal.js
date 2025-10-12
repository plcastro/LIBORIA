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
const EditBookModal = ({ modalOpen, setModalOpen, book, onBookUpdated }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (book) {
      form.setFieldsValue({
        title: book.title,
        author_name: book.author_name,
        category: book.category,
        published_date: book.published_date ? dayjs(book.published_date) : null,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
        description: book.description,
        image: book.image,
      });
    }
  }, [book, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        published_date: values.published_date
          ? values.published_date.format("YYYY-MM-DD")
          : null,
      };

      const res = await fetch(
        `http://localhost:8000/api/books/${book.book_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        messageApi.error(data.error);
        return;
      }

      messageApi.success("Book updated successfully");

      if (onBookUpdated) onBookUpdated({ ...book, ...payload });
      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to update book");
    } finally {
      setLoading(false);
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
        initialValues={{ total_copies: 1 }}
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
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Author Name"
                name="author_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true }]}
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
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const available = getFieldValue("available_copies") || 0;
                      if (value >= available) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Total copies cannot be less than available copies"
                        )
                      );
                    },
                  }),
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Available Copies"
                name="available_copies"
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue("total_copies") || 0;
                      if (value <= total) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Available copies cannot exceed total copies")
                      );
                    },
                  }),
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
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
