import React, { useState } from "react";
import { Modal, message } from "antd";

const DeleteBookModal = ({ open, setOpen, book, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!book) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/books/${book.book_id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.error); // show backend error like "book is borrowed"
        return;
      }

      message.success(data.message);
      setOpen(false);

      if (onDelete) onDelete(book); // update parent state
    } catch (err) {
      console.error(err);
      message.error("Failed to delete book");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default DeleteBookModal;
