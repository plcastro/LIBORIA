import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

const SubmitButton = ({ form, children, disabled }) => {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled}
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        width: "200px",
        "&:hover": { backgroundColor: "#333" },
      }}
    >
      {children}
    </Button>
  );
};

const EditProfile = ({ initialData, isVisible, onClose, onSave }) => {
  const [form, setForm] = useState({
    username: initialData?.username || "",
    name: initialData?.name || "",
    email: initialData?.email || "",
    currPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    severity: "success",
    text: "",
  });

  React.useEffect(() => {
    setForm({
      username: initialData?.username || "",
      name: initialData?.name || "",
      email: initialData?.email || "",
      currPassword: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  }, [initialData, isVisible]);

  const showMessage = (severity, text) => {
    setNotification({ open: true, severity, text: text || "" });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.currPassword) {
      nextErrors.currPassword = "Please enter your current password";
    }

    if (!form.password) {
      nextErrors.password = "Please enter your new password";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please re-enter your new password";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onFinish = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const { currPassword, password, confirmPassword } = form;

    if (password !== confirmPassword) {
      showMessage("error", "Password and Confirm password do not match!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    const userId = user.userid || user._id || user.id;

    if (password === currPassword) {
      showMessage(
        "error",
        "New password cannot be the same as current password.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `http://localhost:8000/api/users/check-pass/${userId}`,
        { currPassword, newPassword: password },
        { headers: { "Content-Type": "application/json" } },
      );

      showMessage("success", response.data.message);
      setForm((prev) => ({
        ...prev,
        currPassword: "",
        password: "",
        confirmPassword: "",
      }));

      onSave?.(response.data);
      onClose();
    } catch (err) {
      if (err.response) {
        showMessage(
          "error",
          err.response.data?.error || "Unable to change password.",
        );
      } else {
        showMessage("error", "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    {
      name: "currPassword",
      label: "Current Password",
      error: errors.currPassword,
    },
    {
      name: "password",
      label: "New Password",
      error: errors.password,
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      error: errors.confirmPassword,
    },
  ];

  const canSubmit =
    form.currPassword && form.password && form.confirmPassword && !loading;

  return (
    <>
      <Dialog
        open={isVisible}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        TransitionProps={{
          onExited: () => {
            setForm({
              username: initialData?.username || "",
              name: initialData?.name || "",
              email: initialData?.email || "",
              currPassword: "",
              password: "",
              confirmPassword: "",
            });
            setErrors({});
          },
        }}
      >
        <DialogTitle>Edit Profile Information</DialogTitle>

        <DialogContent>
          <Box
            component="form"
            id="editProfileForm"
            onSubmit={onFinish}
            autoComplete="off"
            sx={{ pt: 1 }}
          >
            <Stack spacing={2}>
              <TextField
                name="username"
                label="Username"
                value={form.username}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />

              <TextField
                name="name"
                label="Name"
                value={form.name}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />

              <TextField
                name="email"
                label="Email"
                value={form.email}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />

              {passwordFields.map((field) => (
                <TextField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type="password"
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  error={Boolean(field.error)}
                  helperText={field.error}
                  inputProps={{ minLength: 8 }}
                />
              ))}

              <Stack
                direction="row"
                spacing={1}
                alignItems="baseline"
                sx={{ flexWrap: "wrap" }}
              >
                <SubmitButton disabled={!canSubmit}>
                  {loading ? "Saving..." : "Save Password"}
                </SubmitButton>

                <Button
                  onClick={onClose}
                  type="button"
                  variant="outlined"
                  sx={{ width: "200px" }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        >
          {notification.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProfile;
