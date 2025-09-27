import React from "react";
import "./Login.css";
import { Button, Checkbox, Form, Input } from "antd";
const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
const LoginForm = () => (
  <Form
    name="basic"
    labelCol={{ span: 7 }}
    wrapperCol={{ span: 24 }}
    style={{ width: 350 }}
    initialValues={{ remember: true }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
  >
    <h1 style={{ width: 350, textAlign: "center", marginBottom: 50 }}>Login</h1>
    <Form.Item
      label="Username"
      name="username"
      rules={[{ required: true, message: "Please input your username!" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      label="Password"
      name="password"
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Input.Password />
    </Form.Item>

    <Form.Item name="remember" valuePropName="checked" label={null}>
      <Checkbox>Remember me</Checkbox>
    </Form.Item>

    <Form.Item label={null} wrapperCol={{ span: 21 }}>
      <Button type="primary" htmlType="submit" style={{ width: 350 }}>
        Login
      </Button>
    </Form.Item>
    <Form.Item label={null} wrapperCol={{ span: 21 }}>
      <Button htmlType="submit" style={{ width: 350 }}>
        Sign up
      </Button>
    </Form.Item>
  </Form>
);
export default LoginForm;
