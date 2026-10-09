import React, { useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";

const initialForm = {
  image: "",
  title: "",
  author: "",
  category: "",
  published_date: "",
  total_copies: 1,
  description: "",
};

const categories = ["Trending", "Romance", "Kids", "Thriller", "Textbooks"];

const AddBookModal = ({ modal2Open, setModal2Open, onBookCreated }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [bookData, setBookData] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const notify = (severity, message) =>
    setNotification({ open: true, severity, message });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.image.trim()) nextErrors.image = "Please enter the image url";
    if (!formData.title.trim()) nextErrors.title = "Please enter the book title";
    if (!formData.author.trim()) {
      nextErrors.author = "Please enter the author name";
    }
    if (!formData.category) {
      nextErrors.category = "Please select the book category";
    }
    if (!formData.published_date) {
      nextErrors.published_date = "Please select a published date";
    }
    if (!formData.total_copies || Number(formData.total_copies) < 1) {
      nextErrors.total_copies = "Total copies must be at least 1";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
  };

  const handleAddClick = () => {
    if (!validate()) {
      notify("error", "Please complete all required book details.");
      return;
    }

    const normalizedData = {
      title: formData.title,
      author_name: formData.author,
      category: formData.category,
      published_date: formData.published_date || null,
      total_copies: Number(formData.total_copies),
      available_copies: Number(formData.total_copies),
      description: formData.description,
      image: formData.image,
    };

    setBookData(normalizedData);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (!bookData) return;

      await axios.post("http://localhost:8000/api/books", bookData, {
        headers: { "Content-Type": "application/json" },
      });

      resetForm();
      setIsConfirmOpen(false);
      setModal2Open(false);

      if (onBookCreated) onBookCreated();
      notify("success", "Book added successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error(err);
      notify("error", err.message || "Failed to add book");
    }
  };

  const handleDiscard = () => {
    resetForm();
    setModal2Open(false);
    setIsDiscardOpen(false);
    notify("info", "Book entry discarded.");
  };

  const handleClose = () => {
    resetForm();
    setModal2Open(false);
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

      <Dialog open={modal2Open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>ADD BOOK DETAILS</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Image"
                placeholder="Enter Image URL"
                value={formData.image}
                onChange={(e) => updateField("image", e.target.value)}
                error={Boolean(errors.image)}
                helperText={errors.image}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Title"
                placeholder="Enter Book Title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Author"
                placeholder="Enter Author Name"
                value={formData.author}
                onChange={(e) => updateField("author", e.target.value)}
                error={Boolean(errors.author)}
                helperText={errors.author}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                select
                label="Category"
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                error={Boolean(errors.category)}
                helperText={errors.category}
                fullWidth
                size="small"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Published Date"
                type="date"
                value={formData.published_date}
                onChange={(e) => updateField("published_date", e.target.value)}
                error={Boolean(errors.published_date)}
                helperText={errors.published_date}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Total Copies"
                type="number"
                value={formData.total_copies}
                onChange={(e) => updateField("total_copies", e.target.value)}
                error={Boolean(errors.total_copies)}
                helperText={errors.total_copies}
                inputProps={{ min: 1 }}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Book Description"
                placeholder="Enter Book Description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                multiline
                minRows={4}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDiscardOpen(true)}>Discard</Button>
          <Button
            variant="contained"
            onClick={handleAddClick}
            sx={{ backgroundColor: "#000", color: "#fff" }}
          >
            Add Book
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Book Details</DialogTitle>
        <DialogContent dividers>
          {bookData ? (
            <Box>
              {bookData.image && (
                <Box sx={{ textAlign: "center", mb: 1 }}>
                  <img
                    src={bookData.image}
                    alt={bookData.title || "Book Image"}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "contain",
                    }}
                  />
                </Box>
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
            </Box>
          ) : (
            <p>No book data to confirm.</p>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setIsConfirmOpen(false)} sx={{ width: 200 }}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{
              width: 200,
              backgroundColor: "#000",
              color: "#fff",
              borderColor: "#000",
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDiscardOpen}
        onClose={() => setIsDiscardOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Discard Book Entry</DialogTitle>
        <DialogContent dividers>
          <p>
            Are you sure you want to discard this book? All unsaved details will
            be lost.
          </p>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setIsDiscardOpen(false)}>No</Button>
          <Button variant="contained" color="error" onClick={handleDiscard}>
            Yes, Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBookModal;
