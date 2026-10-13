import Button from "../MuiButton.jsx";
import { useEffect, useState } from "react";
import { Modal, Form, Input, Space, message, Select } from "antd";
import axios from "../../api";
const StaffModal = ({
  isVisible,
  mode,
  onClose,
  onSave,
  selectedStaff,
  currentUserId,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isSaving, setIsSaving] = useState(false);
  const [form] = Form.useForm();
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";
  const isDeleteMode = mode === "delete";

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isPreviewConfirmOpen, setIsPreviewConfirmOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [submittable, setSubmittable] = useState(false);
  const loggedInUserId = JSON.parse(sessionStorage.getItem("currentUser"))?._id;
  const values = Form.useWatch([], form);
  const resetTransientState = () => {
    form.resetFields();
    setIsPreviewConfirmOpen(false);
    setIsConfirmDeleteOpen(false);
    setIsCancelConfirmOpen(false);
  };

  useEffect(() => {
    if (isEditMode && selectedStaff) {
      form.setFieldsValue({
        _id: selectedStaff._id,
        name: selectedStaff.name,
        email: selectedStaff.email,
        username: selectedStaff.username,
        account_type: selectedStaff.account_type,
      });
    } else {
      form.resetFields();
    }
  }, [mode, isEditMode, selectedStaff, form]);

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
    if (isSaving) return;
    setIsSaving(true);

    try {
      let response;

      if (isAddMode) {
        response = await axios.post("/users", dataToSave, {
          headers: { "Content-Type": "application/json" },
        });
      } else if (isEditMode) {
        response = await axios.put(
          `/users/${selectedStaff._id}`,
          dataToSave,
          { headers: { "Content-Type": "application/json" } },
        );
      }

      onSave(response?.data);
      onClose();

      resetTransientState();
      messageApi.success(
        isAddMode ? "Staff added successfully!" : "Staff updated successfully!",
      );
    } catch (err) {
      console.error(err);
      messageApi.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong.",
      );
    } finally {
      setIsSaving(false);
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
      if (!selectedStaff) {
        messageApi.error("No staff selected.");
        setIsConfirmDeleteOpen(false);
        return;
      }

      if (selectedStaff._id === currentUserId) {
        messageApi.error("You cannot delete your own account.");
        setIsConfirmDeleteOpen(false);
        return;
      }

      await axios.delete(`/users/${selectedStaff._id}`);

      messageApi.success("User deleted successfully!");
      onSave();
      setIsConfirmDeleteOpen(false);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error(err);
      messageApi.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong.",
      );
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
      {contextHolder}
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
                    "",
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
              <Select
                placeholder="Select user's role:"
                defaultValue="librarian"
              >
                <Option value="Librarian">Librarian</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  disabled={!submittable || isSaving}
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
                disabled={selectedStaff?._id === loggedInUserId} // disable if same user
              >
                Yes, Delete
              </Button>
            </div>

            {selectedStaff?._id === loggedInUserId && (
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
                disabled={isSaving}
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
