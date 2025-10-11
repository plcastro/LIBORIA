import React from "react";
import { Modal, message } from "antd";

const DeleteBookModal = ({ open, setOpen, book, onDelete }) => {
  const handleOk = async () => {
    try {
      await onDelete(book.id);
      setOpen(false);
      message.success("Book deleted successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete book");
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
