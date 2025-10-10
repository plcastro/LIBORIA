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
      const today = dayjs();
      const dueDate = dayjs(initialValues.due_date);
      const daysLate = today.isAfter(dueDate) ? today.diff(dueDate, "day") : 0;

      const latePenalty = daysLate * 10;
      const violations = daysLate > 0 ? ["Late Return"] : [];

      form.setFieldsValue({
        name: initialValues.name,
        penalty: latePenalty,
        bookTitle: initialValues.book_title,
        inCash: 0,
        returnedDate: today,
        violation: violations,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, open]);

  const handleViolationChange = (selectedViolations) => {
    const today = dayjs();
    const dueDate = dayjs(initialValues?.due_date);
    const daysLate = today.isAfter(dueDate) ? today.diff(dueDate, "day") : 0;
    let penalty = daysLate * 10;

    if (selectedViolations.includes("Damaged")) penalty += 50;
    if (selectedViolations.includes("Lost")) penalty += 200;

    form.setFieldsValue({ penalty, violation: selectedViolations });
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            form={form}
            style={{ backgroundColor: "#000", color: "white" }}
          >
            Return
          </Button>
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
                onChange={handleViolationChange}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ReturnBookModal;
