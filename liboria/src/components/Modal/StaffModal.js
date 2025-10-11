import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Space, message, Select } from "antd";
const { Option } = Select;
const StaffModal = ({
  isVisible,
  mode,
  onClose,
  onSave,
  selectedStaff,
  currentUserId,
}) => {
  const [form] = Form.useForm();
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";
  const isDeleteMode = mode === "delete";

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isPreviewConfirmOpen, setIsPreviewConfirmOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [submittable, setSubmittable] = useState(false);
  const loggedInUserId = JSON.parse(
    localStorage.getItem("currentUser")
  )?.userid;
  const values = Form.useWatch([], form);

  useEffect(() => {
    if (isEditMode && selectedStaff) {
      form.setFieldsValue({
        userid: selectedStaff.userid,
        name: selectedStaff.name,
        email: selectedStaff.email,
        username: selectedStaff.username,
        account_type: selectedStaff.account_type,
      });
    } else {
      form.resetFields();
    }
  }, [mode, selectedStaff, form]);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const handlePrimaryClick = async () => {
    try {
      const vals = await form.validateFields();
      setPreviewData(vals);
      setIsPreviewConfirmOpen(true);
    } catch {
      message.warning("Please fill out all required fields before proceeding.");
    }
  };

  const finalizeSave = async (dataToSave) => {
    try {
      if (isAddMode) {
        const res = await fetch("http://localhost:8000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        });

        const result = await res.json();
        if (!res.ok) {
          alert(result.message || "Email/Username already exists");
          return;
        }

        message.success("Staff added successfully!");
        alert("Staff added successfully!.");
        onSave(result); // refresh list
      } else if (isEditMode) {
        const res = await fetch(
          `http://localhost:8000/api/users/${selectedStaff.userid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSave),
          }
        );

        const result = await res.json();
        if (!res.ok) {
          alert(result.message || "Email/Username already exists");
          return;
        }
        message.success("Staff updated successfully!");
        onSave(result);
      }

      form.resetFields();
      setPreviewData(null);
      setIsPreviewConfirmOpen(false);
      window.location.reload();
      onClose();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Something went wrong.");
    }
  };

  const handleCancelClick = () => {
    const current = form.getFieldsValue();
    const hasValues =
      Object.values(current).some((v) => v !== undefined && v !== "") ||
      !!(isEditMode && selectedStaff);

    if (!hasValues) {
      form.resetFields();
      onClose();
      return;
    }
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    form.resetFields();
    setIsCancelConfirmOpen(false);
    onClose();
  };
  const handleCancelCancel = () => setIsCancelConfirmOpen(false);

  const handleOpenConfirmDelete = () => setIsConfirmDeleteOpen(true);

  const handleConfirmDelete = async () => {
    try {
      if (!selectedStaff || selectedStaff.userid === currentUserId) {
        message.error("You cannot delete your own account.");
        setIsConfirmDeleteOpen(false);
        return;
      }

      const res = await fetch(
        `http://localhost:8000/api/users/${selectedStaff.userid}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete user.");
      }

      message.success("User deleted successfully!");
      onSave();
      setIsConfirmDeleteOpen(false);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Something went wrong.");
    }
  };

  const handleCancelDelete = () => setIsConfirmDeleteOpen(false);

  const handleXClose = () => {
    form.resetFields();
    setPreviewData(null);
    setIsConfirmDeleteOpen(false);
    setIsCancelConfirmOpen(false);
    setIsPreviewConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        title={
          isAddMode
            ? "Add New Staff"
            : isEditMode
            ? "Edit Staff"
            : "Delete Staff"
        }
        open={isVisible}
        onCancel={handleXClose}
        footer={null}
        centered
      >
        {(isAddMode || isEditMode) && (
          <Form form={form} layout="vertical" autoComplete="off">
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please input name!" },
                {
                  pattern: /^[A-Za-z\s]+$/,
                  message: "Name should only contain letters and spaces.",
                },
              ]}
            >
              <Input
                placeholder="Enter name"
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(
                    /[^A-Za-z\s]/g,
                    ""
                  );
                  form.setFieldsValue({ name: onlyLetters });
                }}
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email!",
                },
              ]}
            >
              <Input placeholder="Enter staff email" />
            </Form.Item>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input a username!" },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message:
                    "Username can only contain letters, numbers, and underscores.",
                },
              ]}
            >
              <Input placeholder="Enter username" min={8} />
            </Form.Item>
            {isAddMode && (
              <>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please input password!" },
                  ]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>

                <Form.Item
                  name="confirmpassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please re-enter password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Passwords do not match!");
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Re-enter password" />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="account_type"
              label="Role"
              rules={[
                { required: true, message: "Please select user's role!" },
              ]}
            >
              <Select placeholder="Select user's role:">
                <Option value="Librarian">Librarian</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  onClick={handlePrimaryClick}
                  style={{ backgroundColor: "#000", color: "#fff", width: 232 }}
                >
                  {isEditMode ? "Save Changes" : "Add Staff"}
                </Button>
                <Button onClick={handleCancelClick} style={{ width: 232 }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        {isDeleteMode && (
          <>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedStaff?.name}</strong>?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginTop: 20,
              }}
            >
              <Button onClick={onClose} style={{ width: 232 }}>
                No
              </Button>
              <Button
                type="primary"
                onClick={handleOpenConfirmDelete}
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                }}
                disabled={selectedStaff?.userid === loggedInUserId} // disable if same user
              >
                Yes, Delete
              </Button>
            </div>

            {selectedStaff?.userid === loggedInUserId && (
              <p style={{ color: "red", marginTop: 10 }}>
                You cannot delete your own account while logged in.
              </p>
            )}
          </>
        )}
      </Modal>

      <Modal
        title={isEditMode ? "Confirm Changes" : "Confirm New Staff"}
        open={isPreviewConfirmOpen}
        onCancel={handleXClose}
        footer={null}
        centered
      >
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginTop: 20,
              }}
            >
              <Button
                onClick={() => setIsPreviewConfirmOpen(false)}
                style={{ width: 232 }}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={() => finalizeSave(previewData)}
                style={{ backgroundColor: "#000", color: "#fff", width: 232 }}
              >
                Confirm
              </Button>
            </div>
          </>
        ) : (
          <p>No data to confirm.</p>
        )}
      </Modal>

      <Modal
        title="Confirm Delete"
        open={isConfirmDeleteOpen}
        onCancel={handleXClose}
        footer={null}
        centered
      >
        <p>
          This action will permanently delete{" "}
          <strong>{selectedStaff?.name}</strong>. Continue?
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 20,
          }}
        >
          <Button onClick={handleCancelDelete} style={{ width: 232 }}>
            Back
          </Button>
          <Button
            type="primary"
            onClick={handleConfirmDelete}
            style={{ backgroundColor: "#000", color: "#fff", width: 232 }}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal
        title="Discard Changes?"
        open={isCancelConfirmOpen}
        onCancel={handleXClose}
        footer={null}
        centered
      >
        <p>Are you sure you want to cancel? Unsaved changes will be lost.</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 20,
          }}
        >
          <Button onClick={handleCancelCancel} style={{ width: 232 }}>
            No
          </Button>
          <Button
            type="primary"
            onClick={handleConfirmCancel}
            style={{ backgroundColor: "#000", color: "#fff", width: 232 }}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default StaffModal;
