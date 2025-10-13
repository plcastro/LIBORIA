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
  message,
} from "antd";
import dayjs from "dayjs";

const ReturnBookModal = ({ open, onClose, initialValues, REASONS }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const colProps = { xs: 24, md: 12 };

  useEffect(() => {
    if (initialValues) {
      const today = dayjs();
      const dueDate = dayjs(initialValues.due_date);
      const daysLate = today.isAfter(dueDate) ? today.diff(dueDate, "day") : 0;

      const latePenalty = daysLate * 10;
      const violations = daysLate > 0 ? ["Late Return"] : [];

      form.setFieldsValue({
        name: initialValues.borrower_name,
        penalty: latePenalty,
        bookTitle: initialValues.title,
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
  const handleFinish = async (values) => {
    try {
      const payload = {
        borrow_id: initialValues.borrow_id,
        returned_date: dayjs(values.returnedDate).format("YYYY-MM-DD"),
        violation: Array.isArray(values.violation)
          ? values.violation[0] || "None"
          : "None",
        penalty: values.penalty || 0,
        amount_paid: values.inCash || 0,
      };

      // 1️⃣ Update borrowed_books status to 'Returned'
      const updateRes = await fetch(
        `http://localhost:8000/api/borrowed-books/${initialValues.borrow_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Returned" }),
        }
      );

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        console.error("Failed to update borrowed_books:", updateData.error);
        messageApi.error("Failed to update borrowed book status.");
        return;
      }

      // 2️⃣ Insert the record into returned_books
      const insertRes = await fetch(
        "http://localhost:8000/api/returned-books",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const insertData = await insertRes.json();

      if (!insertRes.ok) {
        console.error("Insert failed:", insertData.error);
        messageApi.error("Failed to insert return record.");
        return;
      }

      messageApi.success("Book successfully returned!");
      form.resetFields();
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error while returning book:", err);
      messageApi.error(
        "An unexpected error occurred while returning the book."
      );
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Return Book"
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 10 }}
          onFinish={handleFinish}
        >
          <Row gutter={[24, 8]}>
            <Col {...colProps}>
              <Form.Item name="name" label="Name">
                <Input readOnly />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="penalty" label="Penalty (PHP)">
                <InputNumber
                  style={{ width: "100%" }}
                  readOnly
                  formatter={(v) =>
                    `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(v) => v.replace(/₱\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="bookTitle" label="Book Title">
                <Input readOnly />
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
                <DatePicker style={{ width: "100%" }} readOnly />
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#000", color: "white" }}
            >
              Return
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ReturnBookModal;
