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

  // Calculate penalty based on returned date and violations
  const recalculatePenalty = () => {
    const returnedDate = form.getFieldValue("returnedDate") || dayjs();
    const dueDate = dayjs(initialValues?.due_date);
    let violations = form.getFieldValue("violation") || [];

    // Automatically add/remove "Late Return"
    if (returnedDate.isAfter(dueDate)) {
      if (!violations.includes("Late Return")) violations.push("Late Return");
    } else {
      violations = violations.filter((v) => v !== "Late Return");
    }

    form.setFieldsValue({ violation: violations });

    // Calculate penalty
    const daysLate = returnedDate.isAfter(dueDate)
      ? returnedDate.diff(dueDate, "day")
      : 0;
    let penalty = daysLate * 10;
    if (violations.includes("Damaged")) penalty += 50;
    if (violations.includes("Lost")) penalty += 200;

    form.setFieldsValue({ penalty });
  };

  useEffect(() => {
    if (initialValues) {
      const today = dayjs();
      const dueDate = dayjs(initialValues.due_date);
      const daysLate = today.isAfter(dueDate) ? today.diff(dueDate, "day") : 0;

      const initialViolations = daysLate > 0 ? ["Late Return"] : [];

      form.setFieldsValue({
        name: initialValues.borrower_name,
        bookTitle: initialValues.title,
        penalty: daysLate * 10,
        inCash: 0,
        returnedDate: today,
        violation: initialViolations,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, open]);

  const handleViolationChange = (selectedViolations) => {
    form.setFieldsValue({ violation: selectedViolations });
    recalculatePenalty();
  };

  const handleReturnedDateChange = (date) => {
    form.setFieldsValue({ returnedDate: date });
    recalculatePenalty();
  };

  const handleFinish = async (values) => {
    try {
      // Determine final violation to send as array
      let violations = Array.isArray(values.violation) ? values.violation : [];
      if (!violations.length) violations = ["None"];

      const returnedDate = dayjs(values.returnedDate).format("YYYY-MM-DD");

      // Check amount paid vs penalty if needed
      if (violations.includes("Lost") === false && values.penalty > 0) {
        if (!values.inCash || values.inCash < values.penalty) {
          messageApi.error("Amount paid must cover the penalty.");
          return;
        }
      }

      const payload = {
        borrow_id: initialValues.borrow_id,
        returned_date: returnedDate,
        violation: violations, // array for backend since VARCHAR
        penalty: values.penalty || 0,
        amount_paid: values.inCash || 0,
      };

      // Determine status
      const status = violations.includes("Lost") ? "Lost" : "Returned";

      // 1. Update borrowed_books status
      const updateRes = await fetch(
        `http://localhost:8000/api/borrowed-books/${initialValues.borrow_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!updateRes.ok) {
        messageApi.error("Failed to update borrowed book status.");
        return;
      }

      // 2. Insert into returned_books
      const insertRes = await fetch(
        "http://localhost:8000/api/returned-books",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!insertRes.ok) {
        messageApi.error("Failed to insert return record.");
        return;
      }

      // 3. Increment available copies if not lost
      if (!violations.includes("Lost")) {
        await fetch(
          `http://localhost:8000/api/books/${initialValues.book_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incrementAvailable: 1 }),
          }
        );
      }

      messageApi.success(
        violations.includes("Lost")
          ? "Book marked as lost!"
          : "Book returned successfully!"
      );
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
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={[24, 8]}>
            <Col {...colProps}>
              <Form.Item name="name" label="Name">
                <Input readOnly />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="bookTitle" label="Book Title">
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
              <Form.Item
                name="returnedDate"
                label="Returned Date"
                rules={[
                  { required: true, message: "Returned date is required" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  onChange={handleReturnedDateChange}
                  disabledDate={(current) => {
                    const borrowDate = dayjs(initialValues.date_borrowed);
                    return current && current.isBefore(borrowDate, "day");
                  }}
                />
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

            <Col {...colProps}>
              <Form.Item
                shouldUpdate={(prev, curr) => prev.violation !== curr.violation}
              >
                {({ getFieldValue }) => {
                  const violation = getFieldValue("violation") || [];
                  const hasViolation = violation.length > 0;

                  return (
                    <Form.Item
                      name="inCash"
                      label="Amount Paid"
                      rules={[
                        {
                          required: hasViolation,
                          message:
                            "Please enter the amount paid before returning.",
                        },
                        {
                          validator: (_, value) =>
                            value >= 0
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error("Amount paid cannot be negative.")
                                ),
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        disabled={!hasViolation}
                        formatter={(v) =>
                          `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(v) => v.replace(/₱\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: 20,
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
