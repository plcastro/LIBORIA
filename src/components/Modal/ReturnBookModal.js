import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Row,
  Col,
  Space,
  Button,
} from "antd";
import dayjs from "dayjs";

const ReturnBookModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  REASONS,
}) => {
  const [form] = Form.useForm();
  const colProps = { xs: 24, md: 12 };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        penalty: 0,
        bookTitle: initialValues.book_title,
        inCash: 0,
        returnedDate: dayjs(),
        violation: [],
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, open]);

  const handleFinish = (values) => {
    onSubmit(values);
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="Return Book"
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            htmlType="submit"
            form={form}
            style={{ backgroundColor: "#000" }}
          >
            Return
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 10 }}
      >
        <Row gutter={[24, 8]}>
          <Col {...colProps}>
            <Form.Item name="name" label="Name">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item name="penalty" label="Penalty (PHP)">
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(v) =>
                  `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => v.replace(/₱\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item name="bookTitle" label="Book Title">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item name="inCash" label="Amount Paid">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(v) =>
                  `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => v.replace(/₱\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item name="returnedDate" label="Returned Date">
              <DatePicker style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item name="violation" label="Violation">
              <Select
                mode="tags"
                placeholder="Select Reason"
                options={REASONS}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row justify="center" style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ flex: 1, backgroundColor: "#000", color: "white" }}
              >
                Return
              </Button>
              <Button onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </Button>
            </Space>
          </Col>
        </Row> */}
      </Form>
    </Modal>
  );
};

export default ReturnBookModal;
