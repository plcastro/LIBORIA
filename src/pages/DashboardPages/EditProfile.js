import React, { useEffect } from "react";
import { Button, Form, Input, Select, Space, Modal, message } from "antd";

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

const EditProfile = ({ initialData, isVisible, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        username: initialData.username,
        fullname: initialData.fullname,
        email: initialData.email,
        role: initialData.role,
      });
    }
  }, [initialData, form]);

  const onFinish = (values) => {
    const { password, confirmPassword } = values;
    if (password !== confirmPassword) {
      message.error("Password and Confirm password do not match!");
      return;
    }
    onSave(values);
    message.success("Profile updated successfully!");
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
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select a Role!" }]}
        >
          <Select>
            <Select.Option value="Admin">Admin</Select.Option>
            <Select.Option value="Librarian">Librarian</Select.Option>
          </Select>
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
