import React, { useState } from "react";
import { Button, Form, Input, Space, Modal, message } from "antd";

const SubmitButton = ({ form, children, loading }) => {
  const [submittable, setSubmittable] = React.useState(false);
  const values = Form.useWatch([], form);

  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <Button
      type="primary"
      htmlType="submit"
      disabled={!submittable || loading}
      loading={loading}
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

  const onFinish = async (values) => {
    const { password, confirmPassword } = values;
    
    // Validation
    if (password !== confirmPassword) {
      messageApi.error("Password and Confirm password do not match!");
      return;
    }

    if (password.length < 8) {
      messageApi.error("Password must be at least 8 characters long!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    const userId = user.userid || user._id || user.id;

    if (!userId) {
      messageApi.error("User not found. Please log in again.");
      return;
    }

    // Check if new password is same as current password
    if (password === user.password) {
      messageApi.error("New password cannot be the same as your current password.");
      return;
    }

    try {
      setLoading(true);
      console.log("Updating password for user ID:", userId);
      
      const response = await fetch(
        `http://localhost:8000/api/users/check-pass/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (response.ok) {
        // Update localStorage with new user data (without storing password for security)
        const updatedUser = { 
          ...user
          // Don't update the password in localStorage for security
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        messageApi.success("Password updated successfully!");
        onSave();
        form.resetFields();
        onClose();
      } else {
        // Show the actual error message from backend
        messageApi.error(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error("Update password error:", err);
      messageApi.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Profile Information"
        open={isVisible}
        onCancel={onClose}
        footer={null}
        centered
      >
        <Form
          form={form}
          name="editProfileForm"
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialData}
          autoComplete="off"
        >
          <Form.Item name="username" label="Username">
            <Input readOnly />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input readOnly />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input readOnly />
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
