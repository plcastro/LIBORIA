import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
} from "@mui/material";
import dateValue from "../../utils/dateValue";

const EditBookModal = ({ modalOpen, setModalOpen, book, onBookUpdated }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const notify = (severity, message) =>
    setNotification({ open: true, severity, message });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author_name: book.author_name || "",
        category: book.category || "",
        published_date: book.published_date
          ? dateValue(book.published_date).format("YYYY-MM-DD")
          : "",
        total_copies: book.total_copies || 1,
        available_copies: book.available_copies || 0,
        description: book.description || "",
        image: book.image || "",
      });
      setErrors({});
    }
  }, [book]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.title?.trim()) nextErrors.title = "Title is required";
    if (!formData.author_name?.trim()) {
      nextErrors.author_name = "Author name is required";
    }
    if (!formData.category?.trim()) nextErrors.category = "Category is required";
    if (Number(formData.total_copies) < Number(formData.available_copies)) {
      nextErrors.total_copies =
        "Total copies cannot be less than available copies";
    }
    if (Number(formData.available_copies) > Number(formData.total_copies)) {
      nextErrors.available_copies =
        "Available copies cannot exceed total copies";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOk = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        ...formData,
        total_copies: Number(formData.total_copies),
        available_copies: Number(formData.available_copies),
        published_date: formData.published_date || null,
      };

      await axios.put(
        `http://localhost:8000/api/books/${book.book_id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (onBookUpdated) onBookUpdated({ ...book, ...payload });
      setModalOpen(false);
      notify("success", "Book updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error(err);
      notify("error", err.response?.data?.error || "Failed to update book");
    } finally {
      setLoading(false);
    }
  };

  const handleTotalCopiesChange = (value) => {
    const nextTotal = Number(value);
    const currentTotal = Number(book.total_copies);
    const currentAvailable = Number(book.available_copies);
    const borrowedCount = currentTotal - currentAvailable;

    if (borrowedCount > 0 && nextTotal < currentTotal) {
      notify(
        "warning",
        "You cannot decrease total copies while some books are still borrowed."
      );
      updateField("total_copies", currentTotal);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      total_copies: value,
      available_copies:
        Number(prev.available_copies) > nextTotal
          ? nextTotal
          : prev.available_copies,
    }));
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

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Image URL"
                value={formData.image || ""}
                onChange={(e) => updateField("image", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                value={formData.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Author Name"
                value={formData.author_name || ""}
                onChange={(e) => updateField("author_name", e.target.value)}
                error={Boolean(errors.author_name)}
                helperText={errors.author_name}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                value={formData.category || ""}
                onChange={(e) => updateField("category", e.target.value)}
                error={Boolean(errors.category)}
                helperText={errors.category}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Published Date"
                type="date"
                value={formData.published_date || ""}
                onChange={(e) => updateField("published_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Copies"
                type="number"
                value={formData.total_copies || 1}
                onChange={(e) => handleTotalCopiesChange(e.target.value)}
                error={Boolean(errors.total_copies)}
                helperText={errors.total_copies}
                inputProps={{ min: 1 }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Available Copies"
                type="number"
                value={formData.available_copies || 0}
                onChange={(e) => updateField("available_copies", e.target.value)}
                error={Boolean(errors.available_copies)}
                helperText={errors.available_copies}
                inputProps={{ min: 0 }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                multiline
                minRows={3}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleOk} disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditBookModal;
