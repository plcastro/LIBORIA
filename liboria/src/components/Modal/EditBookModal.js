import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";

const EditBookModal = ({ modalOpen, setModalOpen, book, onBookUpdated }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (book) {
      form.setFieldsValue(book);
    }
  }, [book, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const response = await fetch(
        `http://localhost:8000/api/books/${book.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Failed to update book");

      message.success("Book updated successfully");
      onBookUpdated();
    } catch (error) {
      console.error(error);
      message.error("Failed to update book");
    }
  };

  return (
    <Modal
      title="Edit Book"
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      onOk={handleSave}
      okText="Save"
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="title" label="Book Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="author_name"
          label="Author Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Input />
        </Form.Item>
        <Form.Item
          name="total_copies"
          label="Total Copies"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="image" label="Image URL">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditBookModal;
