import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import dateValue from "../../utils/dateValue";

const ReturnBookModal = ({ open, onClose, initialValues, REASONS }) => {
  const [formData, setFormData] = useState({
    name: "",
    bookTitle: "",
    penalty: 0,
    inCash: 0,
    returnedDate: "",
    violation: [],
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const notify = (severity, message) =>
    setNotification({ open: true, severity, message });

  const calculatePenalty = (returnedDate, violations) => {
    if (!initialValues?.due_date || !returnedDate) return 0;

    const returned = dateValue(returnedDate);
    const dueDate = dateValue(initialValues.due_date);
    const daysLate = returned.isAfter(dueDate)
      ? returned.diff(dueDate, "day")
      : 0;

    let penalty = daysLate * 10;
    if (violations.includes("Damaged")) penalty += 50;
    if (violations.includes("Lost")) penalty += 200;
    return penalty;
  };

  const normalizeViolations = (returnedDate, selectedViolations) => {
    let violations = [...selectedViolations];
    const returned = dateValue(returnedDate);
    const dueDate = dateValue(initialValues?.due_date);

    if (returned.isAfter(dueDate)) {
      if (!violations.includes("Late Return")) violations.push("Late Return");
    } else {
      violations = violations.filter((violation) => violation !== "Late Return");
    }

    return violations;
  };

  useEffect(() => {
    if (initialValues) {
      const today = dateValue();
      const dueDate = dateValue(initialValues.due_date);
      const daysLate = today.isAfter(dueDate) ? today.diff(dueDate, "day") : 0;
      const initialViolations = daysLate > 0 ? ["Late Return"] : [];

      setFormData({
        name: initialValues.borrower_name,
        bookTitle: initialValues.title,
        penalty: daysLate * 10,
        inCash: 0,
        returnedDate: today.format("YYYY-MM-DD"),
        violation: initialViolations,
      });
      setErrors({});
    } else {
      setFormData({
        name: "",
        bookTitle: "",
        penalty: 0,
        inCash: 0,
        returnedDate: "",
        violation: [],
      });
      setErrors({});
    }
  }, [initialValues, open]);

  const handleReturnedDateChange = (value) => {
    const violations = normalizeViolations(value, formData.violation);
    setFormData((prev) => ({
      ...prev,
      returnedDate: value,
      violation: violations,
      penalty: calculatePenalty(value, violations),
    }));
    setErrors((prev) => ({ ...prev, returnedDate: "" }));
  };

  const handleViolationChange = (selectedViolations) => {
    const violations = normalizeViolations(
      formData.returnedDate,
      selectedViolations
    );
    setFormData((prev) => ({
      ...prev,
      violation: violations,
      penalty: calculatePenalty(prev.returnedDate, violations),
    }));
  };

  const handleFinish = async () => {
    const nextErrors = {};
    if (!formData.returnedDate) {
      nextErrors.returnedDate = "Returned date is required";
    }

    const hasViolation = formData.violation.length > 0;
    if (hasViolation && Number(formData.inCash) < Number(formData.penalty)) {
      nextErrors.inCash = "Amount paid must cover the penalty.";
    }
    if (Number(formData.inCash) < 0) {
      nextErrors.inCash = "Amount paid cannot be negative.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify("error", Object.values(nextErrors)[0]);
      return;
    }

    try {
      let violations = Array.isArray(formData.violation)
        ? formData.violation
        : [];
      if (!violations.length) violations = ["None"];

      const payload = {
        borrow_id: initialValues.borrow_id,
        returned_date: dateValue(formData.returnedDate).format("YYYY-MM-DD"),
        violation: violations,
        penalty: formData.penalty || 0,
        amount_paid: formData.inCash || 0,
      };

      const status = violations.includes("Lost") ? "Lost" : "Returned";

      await axios.put(
        `http://localhost:8000/api/borrowed-books/${initialValues.borrow_id}`,
        { status },
        { headers: { "Content-Type": "application/json" } }
      );

      await axios.post("http://localhost:8000/api/returned-books", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!violations.includes("Lost")) {
        await axios.put(
          `http://localhost:8000/api/books/${initialValues.book_id}`,
          { incrementAvailable: 1 },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      notify(
        "success",
        violations.includes("Lost")
          ? "Book marked as lost!"
          : "Book returned successfully!"
      );
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error while returning book:", err);
      notify("error", "An unexpected error occurred while returning the book.");
    }
  };

  const minReturnedDate = initialValues?.date_borrowed
    ? dateValue(initialValues.date_borrowed).format("YYYY-MM-DD")
    : undefined;
  const hasViolation = formData.violation.length > 0;

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
        <DialogTitle>Return Book</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                value={formData.name}
                InputProps={{ readOnly: true }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Book Title"
                value={formData.bookTitle}
                InputProps={{ readOnly: true }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Penalty (PHP)"
                value={`PHP ${Number(formData.penalty || 0).toLocaleString()}`}
                InputProps={{ readOnly: true }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Returned Date"
                type="date"
                value={formData.returnedDate}
                onChange={(e) => handleReturnedDateChange(e.target.value)}
                error={Boolean(errors.returnedDate)}
                helperText={errors.returnedDate}
                inputProps={{ min: minReturnedDate }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Violation</InputLabel>
                <Select
                  multiple
                  value={formData.violation}
                  onChange={(e) => handleViolationChange(e.target.value)}
                  input={<OutlinedInput label="Violation" />}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {REASONS.map((reason) => (
                    <MenuItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Amount Paid"
                type="number"
                value={formData.inCash}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inCash: Number(e.target.value),
                  }))
                }
                error={Boolean(errors.inCash)}
                helperText={errors.inCash}
                disabled={!hasViolation}
                inputProps={{ min: 0 }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleFinish}
            sx={{ backgroundColor: "#000", color: "white" }}
          >
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReturnBookModal;
