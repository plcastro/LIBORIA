import React, { useState, useEffect } from "react";
import { Button, Form, Input, Space, Modal, message } from "antd";
import axios from "axios";
import { API_BASE_URL } from "../../utils/API_BASE";
const SubmitButton = ({ form, children, loading }) => {
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    let mounted = true;

    form
      .validateFields({ validateOnly: true })
      .then(() => {
        if (mounted) {
          setSubmittable(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setSubmittable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [form, values]);

  return (
    <Button
      type="primary"
      htmlType="submit"
      disabled={!submittable || loading}
      loading={loading}
      style={{
        backgroundColor: "#000",
        color: "#fff",
        width: "200px",
      }}
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

    // Validate password confirmation
    if (password !== confirmPassword) {
      messageApi.error("Password and Confirm password do not match!");
      return;
    }

    // Get the logged-in user
    let user = {};

    try {
      user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    } catch {
      messageApi.error("Unable to read user information. Please log in again.");
      return;
    }

    const userId = user._id || user.id;

    if (!userId) {
      messageApi.error("User ID not found. Please log in again.");
      return;
    }

    // Prevent using the current password as the new password
    if (password === currPassword) {
      messageApi.error("New password cannot be the same as current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${API_BASE_URL}/api/users/check-pass/${userId}`,
        {
          currPassword,
          newPassword: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      messageApi.success(
        response.data?.message || "Password changed successfully.",
      );

      // Clear the password fields
      form.resetFields();

      // Notify the parent component
      if (onSave) {
        onSave(response.data);
      }

      // Close the modal
      if (onClose) {
        onClose();
      }
    } catch (err) {
      if (err.response) {
        messageApi.error(
          err.response.data?.error ||
            err.response.data?.message ||
            "Unable to change password.",
        );
      } else {
        messageApi.error(
          "Network error. Please check your connection and try again.",
        );
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
        destroyOnHidden
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
              {
                required: true,
                message: "Please enter your current password",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="New Password"
            dependencies={["currPassword"]}
            rules={[
              {
                required: true,
                message: "Please enter your new password",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value !== getFieldValue("currPassword")) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      "New password cannot be the same as current password.",
                    ),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please re-enter your new password",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("The passwords do not match."),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Space align="baseline" wrap>
              <SubmitButton form={form} loading={loading}>
                Save Password
              </SubmitButton>

              <Button
                onClick={onClose}
                htmlType="button"
                disabled={loading}
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
