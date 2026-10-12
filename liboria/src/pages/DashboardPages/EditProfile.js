import React, { useState, useEffect } from "react";
import { Button, Form, Input, Space, Modal, message } from "antd";
import axios from "axios";
const SubmitButton = ({ form, children }) => {
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <Button
      type="primary"
      htmlType="submit"
      disabled={!submittable}
      style={{ backgroundColor: "#000", color: "#fff", width: "200px" }}
    >
      {children}
    </Button>
  );
};

const EditProfile = ({ initialData, isVisible, onClose, onSave }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      {contextHolder}
      <Modal
        title="Change Password"
        open={isVisible}
        onCancel={onClose}
        footer={null}
        afterClose={() => form.resetFields()}
      >
        <Form
          form={form}
          name="editProfileForm"
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialData}
          autoComplete="off"
        >
          <Form.Item
            name="currPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password minLength={8} />
          </Form.Item>
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
            ]}
          >
            <Input.Password minLength={8} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: "Please re-enter your new password" },
            ]}
          >
            <Input.Password minLength={8} />
          </Form.Item>

          <Form.Item>
            <Space align="baseline">
              <SubmitButton form={form}>Save Password</SubmitButton>
              <Button
                onClick={onClose}
                htmlType="button"
                style={{ width: "200px" }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditProfile;
