import React, { useState } from "react";
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

const EditProfile = ({ initialData, isVisible, onClose, onSave }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { currPassword, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      messageApi.error("Password and Confirm password do not match!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    const userId = user.userid || user._id || user.id;

    if (password === currPassword) {
      messageApi.error("New password cannot be the same as current password.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/users/check-pass/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currPassword, newPassword: password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        messageApi.success(data.message);
        form.resetFields();
        onClose();
      } else {
        messageApi.error(data.error);
      }
    } catch (err) {
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
