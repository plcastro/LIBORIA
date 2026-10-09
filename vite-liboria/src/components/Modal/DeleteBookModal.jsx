import React, { useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from "@mui/material";

const DeleteBookModal = ({ open, setOpen, book, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const notify = (severity, message) =>
    setNotification({ open: true, severity, message });

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
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          {book && (
            <p>
              Are you sure you want to delete <strong>{book.title}</strong>?
              This action cannot be undone.
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleOk}
            disabled={loading}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteBookModal;
