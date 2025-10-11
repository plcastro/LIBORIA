import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Row, Col, Button, Select } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const BorrowBookModal = ({ open, onClose, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const colProps = { xs: 24, md: 12 };

  useEffect(() => {
    if (open && initialValues) {
      const today = dayjs();
      const dueDate = today.add(7, "day");

      form.setFieldsValue({
        name: "",
        year_level: "",
        course: "",
        created_at: today,
        due_date: dueDate,
        book_title: initialValues.book_title || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleFinish = (values) => {
    onSubmit(values);
    onClose();
    form.resetFields();
  };

  //limit 14 days
  const disabledDate = (current) => {
    const borrowDate = form.getFieldValue("created_at") || dayjs();
    const minDate = borrowDate.add(1, "day"); // exclude today
    const maxDate = borrowDate.add(14, "day");
    return (
      current &&
      (current.isBefore(minDate, "day") || current.isAfter(maxDate, "day"))
    );
  };
  return (
    <Modal
      title="Borrow Book"
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" form={form}>
            Borrow
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={[24, 8]}>
          <Col {...colProps}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item
              name="year_level"
              label="Year Level"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select year level">
                <Option value="1st Year">1st Year</Option>
                <Option value="2nd Year">2nd Year</Option>
                <Option value="3rd Year">3rd Year</Option>
                <Option value="4th Year">4th Year</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item
              name="course"
              label="Course"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select course">
                <Option value="BS Information Technology">
                  BS Information Technology
                </Option>
                <Option value="BS Tourism Management">
                  BS Tourism Management
                </Option>
                <Option value="BS Psychology">BS Psychology</Option>
                <Option value="BS Nursing">BS Nursing</Option>
                <Option value="BS Medical Technology">
                  BS Medical Technology
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item name="book_title" label="Book Title">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item name="created_at" label="Borrow Date">
              <DatePicker style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item name="due_date" label="Due Date">
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                placeholder="Select due date (max 14 days)"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default BorrowBookModal;
