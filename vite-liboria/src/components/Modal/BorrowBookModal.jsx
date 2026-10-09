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
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import dateValue from "../../utils/dateValue";

const initialForm = {
  name: "",
  year_level: "",
  course: "",
  created_at: "",
  due_date: "",
  book_title: "",
};

const BorrowBookModal = ({ open, onClose, onSubmit, initialValues }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const notify = (severity, message) =>
    setNotification({ open: true, severity, message });

  useEffect(() => {
    if (open && initialValues) {
      const today = dateValue();
      const dueDate = today.add(7, "day");

      setFormData({
        name: "",
        year_level: "",
        course: "",
        created_at: today.format("YYYY-MM-DD"),
        due_date: dueDate.format("YYYY-MM-DD"),
        book_title: initialValues.book_title || "",
      });
      setErrors({});
    } else if (!open) {
      setFormData(initialForm);
      setErrors({});
    }
  }, [open, initialValues]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.year_level) nextErrors.year_level = "Year level is required";
    if (!formData.course) nextErrors.course = "Course is required";
    if (!formData.due_date) nextErrors.due_date = "Due date is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNameBlur = async () => {
    const name = formData.name.trim();
    if (!name) return;

    try {
      const { data: borrowers } = await axios.get(
        "http://localhost:8000/api/borrowers"
      );

      const borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      if (borrower) {
        setFormData((prev) => ({
          ...prev,
          year_level: borrower.year_level,
          course: borrower.course,
        }));
        notify("info", "Borrower found - auto-filled details.");
      } else {
        setFormData((prev) => ({ ...prev, year_level: "", course: "" }));
        notify("warning", "New borrower detected - please fill out details.");
      }
    } catch (err) {
      console.error("Error fetching borrower:", err);
    }
  };

  const handleBorrow = async () => {
    if (!validate()) return;

    try {
      const name = formData.name.trim();
      const borrowerPayload = {
        name,
        year_level: formData.year_level,
        course: formData.course,
        created_at: dateValue(formData.created_at).format("YYYY-MM-DD"),
      };

      const { data: borrowers } = await axios.get(
        "http://localhost:8000/api/borrowers"
      );

      let borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      if (!borrower) {
        try {
          const { data } = await axios.post(
            "http://localhost:8000/api/borrowers",
            borrowerPayload,
            { headers: { "Content-Type": "application/json" } }
          );
          borrower = data;
        } catch (error) {
          console.error(
            "Borrower creation failed:",
            error.response?.data?.error
          );
          return;
        }
      }

      const borrowPayload = {
        borrower_id: borrower.borrower_id,
        book_id: initialValues.book_id,
        date_borrowed: dateValue(formData.created_at).format("YYYY-MM-DD"),
        due_date: dateValue(formData.due_date).format("YYYY-MM-DD"),
        status: "Borrowed",
      };

      const borrowRes = await axios.post(
        "http://localhost:8000/api/borrowed-books",
        borrowPayload,
        { headers: { "Content-Type": "application/json" } }
      );

      onSubmit(borrowRes.data);
      onClose();
      setFormData(initialForm);
      notify("success", `Borrowed ${initialValues.book_title} successfully!`);
      window.location.reload();
    } catch (err) {
      console.error("Error while borrowing:", err);
      const errorMessage = err.response?.data?.error || "";
      if (errorMessage.includes("already borrowed")) {
        notify("error", "Student already borrowed this book!");
      } else if (errorMessage.includes("limit reached")) {
        notify(
          "error",
          "Borrow limit reached. You can only borrow up to 3 books at a time."
        );
      } else {
        notify("error", "Failed to borrow book. Please try again.");
      }
    }
  };

  const borrowDate = dateValue(formData.created_at || undefined);
  const minDueDate = borrowDate.add(1, "day").format("YYYY-MM-DD");
  const maxDueDate = borrowDate.add(14, "day").format("YYYY-MM-DD");

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

      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Borrow Book</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                onBlur={handleNameBlur}
                error={Boolean(errors.name)}
                helperText={errors.name}
                autoComplete="off"
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Year Level"
                value={formData.year_level}
                onChange={(e) => updateField("year_level", e.target.value)}
                error={Boolean(errors.year_level)}
                helperText={errors.year_level}
                fullWidth
                size="small"
              >
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(
                  (year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Course"
                value={formData.course}
                onChange={(e) => updateField("course", e.target.value)}
                error={Boolean(errors.course)}
                helperText={errors.course}
                fullWidth
                size="small"
              >
                {[
                  "BS Information Technology",
                  "BS Tourism Management",
                  "BS Psychology",
                  "BS Nursing",
                  "BS Medical Technology",
                ].map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Book Title"
                value={formData.book_title}
                disabled
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Borrow Date"
                type="date"
                value={formData.created_at}
                disabled
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
                error={Boolean(errors.due_date)}
                helperText={errors.due_date || "Select due date (max 14 days)"}
                inputProps={{ min: minDueDate, max: maxDueDate }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleBorrow}>
            Borrow
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BorrowBookModal;
