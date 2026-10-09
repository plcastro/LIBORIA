import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";

const initialForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  confirmpassword: "",
  account_type: "",
};

const StaffModal = ({
  isVisible,
  mode,
  onClose,
  onSave,
  selectedStaff,
  currentUserId,
}) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isPreviewConfirmOpen, setIsPreviewConfirmOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";
  const isDeleteMode = mode === "delete";
  const loggedInUserId = JSON.parse(
    localStorage.getItem("currentUser")
  )?.userid;

  const notify = (severity, message) =>
    setNotification({ open: true, severity, message });

  useEffect(() => {
    if (isEditMode && selectedStaff) {
      setFormData({
        userid: selectedStaff.userid,
        name: selectedStaff.name || "",
        email: selectedStaff.email || "",
        username: selectedStaff.username || "",
        password: "",
        confirmpassword: "",
        account_type: selectedStaff.account_type || "",
      });
      setErrors({});
    } else if (isAddMode) {
      setFormData(initialForm);
      setErrors({});
    }
  }, [mode, selectedStaff, isEditMode, isAddMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Please input name!";
    if (formData.name && !/^[A-Za-z\s]+$/.test(formData.name)) {
      nextErrors.name = "Name should only contain letters and spaces.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please input a valid email!";
    }
    if (!formData.username.trim()) {
      nextErrors.username = "Please input a username!";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      nextErrors.username =
        "Username can only contain letters, numbers, and underscores.";
    }
    if (isAddMode && !formData.password) {
      nextErrors.password = "Please input password!";
    }
    if (isAddMode && !formData.confirmpassword) {
      nextErrors.confirmpassword = "Please re-enter password!";
    }
    if (
      isAddMode &&
      formData.password &&
      formData.confirmpassword &&
      formData.password !== formData.confirmpassword
    ) {
      nextErrors.confirmpassword = "Passwords do not match!";
    }
    if (!formData.account_type) {
      nextErrors.account_type = "Please select user's role!";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetTransientState = () => {
    setPreviewData(null);
    setIsConfirmDeleteOpen(false);
    setIsCancelConfirmOpen(false);
    setIsPreviewConfirmOpen(false);
    setErrors({});
  };

  const handlePrimaryClick = () => {
    if (!validate()) {
      notify("warning", "Please fill out all required fields before proceeding.");
      return;
    }

    const data = { ...formData };
    if (isEditMode) {
      delete data.password;
      delete data.confirmpassword;
    }
    setPreviewData(data);
    setIsPreviewConfirmOpen(true);
  };

  const finalizeSave = async (dataToSave) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      let response;

      if (isAddMode) {
        response = await axios.post(
          "http://localhost:8000/api/users",
          dataToSave,
          { headers: { "Content-Type": "application/json" } }
        );
      } else if (isEditMode) {
        response = await axios.put(
          `http://localhost:8000/api/users/${selectedStaff.userid}`,
          dataToSave,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      onSave(response?.data);
      onClose();

      setFormData(initialForm);
      resetTransientState();
      notify(
        "success",
        isAddMode ? "Staff added successfully!" : "Staff updated successfully!"
      );
    } catch (err) {
      console.error(err);
      notify(
        "error",
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    const hasValues =
      Object.values(formData).some((v) => v !== undefined && v !== "") ||
      Boolean(isEditMode && selectedStaff);

    if (!hasValues) {
      setFormData(initialForm);
      onClose();
      return;
    }
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setFormData(initialForm);
    setIsCancelConfirmOpen(false);
    onClose();
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedStaff) {
        notify("error", "No staff selected.");
        setIsConfirmDeleteOpen(false);
        return;
      }

      if (selectedStaff.userid === currentUserId) {
        notify("error", "You cannot delete your own account.");
        setIsConfirmDeleteOpen(false);
        return;
      }

      await axios.delete(
        `http://localhost:8000/api/users/${selectedStaff.userid}`
      );

      notify("success", "User deleted successfully!");
      onSave();
      setIsConfirmDeleteOpen(false);
      setFormData(initialForm);
      onClose();
    } catch (err) {
      console.error(err);
      notify(
        "error",
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong."
      );
    }
  };

  const handleXClose = () => {
    setFormData(initialForm);
    resetTransientState();
    onClose();
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

      <Dialog open={isVisible} onClose={handleXClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isAddMode ? "Add New Staff" : isEditMode ? "Edit Staff" : "Delete Staff"}
        </DialogTitle>
        <DialogContent dividers>
          {(isAddMode || isEditMode) && (
            <Box component="form" autoComplete="off">
              <TextField
                label="Name"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) =>
                  updateField("name", e.target.value.replace(/[^A-Za-z\s]/g, ""))
                }
                error={Boolean(errors.name)}
                helperText={errors.name}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                placeholder="Enter staff email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => updateField("username", e.target.value)}
                error={Boolean(errors.username)}
                helperText={errors.username}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />

              {isAddMode && (
                <>
                  <TextField
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmpassword}
                    onChange={(e) =>
                      updateField("confirmpassword", e.target.value)
                    }
                    error={Boolean(errors.confirmpassword)}
                    helperText={errors.confirmpassword}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              <TextField
                select
                label="Role"
                value={formData.account_type}
                onChange={(e) => updateField("account_type", e.target.value)}
                error={Boolean(errors.account_type)}
                helperText={errors.account_type}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <MenuItem value="Librarian">Librarian</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            </Box>
          )}

          {isDeleteMode && (
            <>
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedStaff?.name}</strong>?
              </p>

              {selectedStaff?.userid === loggedInUserId && (
                <p style={{ color: "red", marginTop: 10 }}>
                  You cannot delete your own account while logged in.
                </p>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          {(isAddMode || isEditMode) && (
            <>
              <Button
                variant="contained"
                onClick={handlePrimaryClick}
                sx={{ backgroundColor: "#000", color: "#fff", width: 232 }}
              >
                {isEditMode ? "Save Changes" : "Add Staff"}
              </Button>
              <Button onClick={handleCancelClick} sx={{ width: 232 }}>
                Cancel
              </Button>
            </>
          )}

          {isDeleteMode && (
            <>
              <Button onClick={onClose} sx={{ width: 232 }}>
                No
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsConfirmDeleteOpen(true)}
                disabled={selectedStaff?.userid === loggedInUserId}
                sx={{
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                }}
              >
                Yes, Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPreviewConfirmOpen}
        onClose={handleXClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? "Confirm Changes" : "Confirm New Staff"}
        </DialogTitle>
        <DialogContent dividers>
          {previewData ? (
            <>
              <p>
                <strong>Name:</strong> {previewData.name}
              </p>
              <p>
                <strong>Email:</strong> {previewData.email}
              </p>
              <p>
                <strong>Username:</strong> {previewData.username}
              </p>
              <p>
                <strong>Role:</strong> {previewData.account_type}
              </p>
            </>
          ) : (
            <p>No data to confirm.</p>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button
            onClick={() => setIsPreviewConfirmOpen(false)}
            sx={{ width: 232 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => finalizeSave(previewData)}
            disabled={isSaving}
            sx={{ backgroundColor: "#000", color: "#fff", width: 232 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isConfirmDeleteOpen}
        onClose={handleXClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <p>
            This action will permanently delete{" "}
            <strong>{selectedStaff?.name}</strong>. Continue?
          </p>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button onClick={() => setIsConfirmDeleteOpen(false)} sx={{ width: 232 }}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{ backgroundColor: "#000", color: "#fff", width: 232 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isCancelConfirmOpen}
        onClose={handleXClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent dividers>
          <p>Are you sure you want to cancel? Unsaved changes will be lost.</p>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button onClick={() => setIsCancelConfirmOpen(false)} sx={{ width: 232 }}>
            No
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmCancel}
            sx={{ backgroundColor: "#000", color: "#fff", width: 232 }}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffModal;
