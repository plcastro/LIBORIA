import React, { useState } from "react";
import { Modal, message } from "antd";
import axios from "axios";
const DeleteBookModal = ({ open, setOpen, book, onDelete }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!book) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/api/books/${book.book_id}`);

      setOpen(false);

      if (onDelete) onDelete(book);
      notify("success", "Book deleted successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error(err);
      notify("error", err.response?.data?.error || "Failed to delete book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Confirm Delete"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        okText="Yes, Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={loading} // disables OK while loading
        centered
      >
        {book && (
          <p>
            Are you sure you want to delete <strong>{book.title}</strong>? This
            action cannot be undone.
          </p>
        )}
      </Modal>
    </>
  );
};

export default DeleteBookModal;
