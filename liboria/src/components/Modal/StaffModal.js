import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Space, message } from "antd";

const StaffModal = ({ isVisible, mode, onClose, onSave, selectedStaff }) => {
  const [form] = Form.useForm();
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";
  const isDeleteMode = mode === "delete";

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isPreviewConfirmOpen, setIsPreviewConfirmOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    if (isEditMode && selectedStaff) {
      form.setFieldsValue({
        name: selectedStaff.name,
        email: selectedStaff.email,
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

  const finalizeSave = (dataToSave) => {
    onSave(dataToSave);
    form.resetFields();
    setPreviewData(null);
    setIsPreviewConfirmOpen(false);
    onClose();
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
  const handleConfirmDelete = () => {
    onSave(selectedStaff);
    setIsConfirmDeleteOpen(false);
    form.resetFields();
    onClose();
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
                { required: true, message: "Please input the name!" },
                {
                  pattern: /^[A-Za-z\s]+$/,
                  message: "Name should only contain letters and spaces.",
                },
              ]}
            >
              <Input
                placeholder="Enter staff name"
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
              <Button onClick={onClose}>No</Button>
              <Button
                type="primary"
                onClick={handleOpenConfirmDelete}
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                }}
              >
                Yes, Delete
              </Button>
            </div>
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
