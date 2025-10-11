import React, { useEffect } from "react";
import { Button, Form, Input, Space, Modal, message } from "antd";

const SubmitButton = ({ form, children }) => {
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
      disabled={!submittable}
      style={{ backgroundColor: "#000", color: "#fff", width: "200px" }}
    >
      {children}
    </Button>
  );
};

// Helper to check email uniqueness
const checkEmailUnique = async (email, userId) => {
  try {
    const response = await fetch(
      "http://localhost:8000/api/users/check-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      }
    );
    const data = await response.json();
    return data.unique; // true if unique, false if exists
  } catch {
    return false;
  }
};

const EditProfile = ({ initialData, isVisible, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    // Get current user info from localStorage if initialData is not provided
    const user =
      initialData || JSON.parse(localStorage.getItem("currentUser")) || {};
    form.setFieldsValue({
      username: user.username || "",
      fullname: user.name || user.fullname || "",
      email: user.email || "",
      role: user.role || "",
    });
  }, [initialData, form]);

  const onFinish = async (values) => {
    const { password, confirmPassword, email } = values;
    if (password !== confirmPassword) {
      message.error("Password and Confirm password do not match!");
      return;
    }

    // Get current user info from localStorage
    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    const userId = user.userid || user._id || user.id;

    // Check email uniqueness before saving
    const isEmailUnique = await checkEmailUnique(email, userId);
    if (!isEmailUnique) {
      message.error("Email is already registered. Please use another.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: values.username,
            name: values.fullname,
            email: values.email,
            password: values.password,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const updatedUser = {
          ...user,
          username: data.username,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        message.success("Profile updated successfully!");
        onSave(updatedUser);
        onClose();
      } else {
        if (data.error && data.error.toLowerCase().includes("username")) {
          message.error("Username is already taken. Please choose another.");
        } else {
          message.error(data.error || "Failed to update profile.");
        }
      }
    } catch (err) {
      message.error("Network error. Please try again.");
    }
  };

  return (
    <Modal
      title="Edit Profile Information"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        name="editProfileForm"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="fullname"
          label="Name"
          rules={[{ required: true, message: "Please input your Full Name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input a valid Email!",
            },
          ]}
        >
          <Input />
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
            <SubmitButton form={form}>Save Changes</SubmitButton>
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
  );
};

export default EditProfile;
