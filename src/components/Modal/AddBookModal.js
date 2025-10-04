import React from "react";
import {
  Input,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Upload,
  Col,
  Row,
} from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { confirm } = Modal;

const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

const AddBookModal = ({ modal2Open, setModal2Open }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form Values:", values);
      // Reset form before closing to ensure fields are cleared immediately
      form.resetFields();
      setModal2Open(false);
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  return (
    <Modal
      title="ADD BOOK DETAILS"
      centered
      open={modal2Open}
      onOk={handleOk}
      onCancel={() => setModal2Open(false)}
      okText="Add Book"
      cancelText="Discard"
      width={800}
      // Ensures the form is fully cleaned up when the modal closes
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
        labelAlign="left"
      >
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="Image"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: "Please upload an image" }]}
            >
              <Upload listType="picture-card" maxCount={1}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "Please enter the book title" },
              ]}
            >
              <Input placeholder="Enter Book Title" />
            </Form.Item>

            <Form.Item
              label="Author"
              name="author"
              rules={[
                { required: true, message: "Please enter the author name" },
              ]}
            >
              <Input placeholder="Enter Author Name" />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[
                { required: true, message: "Please enter the book category" },
              ]}
            >
              <Input placeholder="Enter Book Category" />
            </Form.Item>

            <Form.Item
              label="Published Date"
              name="publishedDate"
              rules={[
                { required: true, message: "Please select a published date" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Total Copies"
              name="copies"
              rules={[{ required: true, message: "Please enter total copies" }]}
            >
              <InputNumber
                placeholder="Enter Copies"
                defaultValue={1}
                min={1}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Book Description"
              name="description"
              rules={[
                { required: true, message: "Please enter book description" },
              ]}
            >
              <TextArea rows={4} placeholder="Enter Book Description" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddBookModal;
