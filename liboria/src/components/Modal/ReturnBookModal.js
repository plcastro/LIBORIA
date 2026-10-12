
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
import axios from "axios";

const ReturnBookModal = ({ open, onClose, initialValues, REASONS }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const colProps = { xs: 24, md: 12 };

  const recalculatePenalty = () => {
    const returnedDate = form.getFieldValue("returnedDate") || dayjs();
    const dueDate = dayjs(initialValues?.due_date);

    if (!dueDate.isValid() || !returnedDate.isValid()) return;

    let violations = [...(form.getFieldValue("violation") || [])];

    if (returnedDate.isAfter(dueDate, "day")) {
      if (!violations.includes("Late Return")) {
        violations.push("Late Return");
      }
    } else {
      violations = violations.filter((v) => v !== "Late Return");
    }

    form.setFieldsValue({ violation: violations });

    const daysLate = returnedDate.isAfter(dueDate, "day")
      ? returnedDate.startOf("day").diff(dueDate.startOf("day"), "day")
      : 0;

    let penalty = daysLate * 10;

    if (violations.includes("Damaged")) penalty += 50;
    if (violations.includes("Lost")) penalty += 200;

    form.setFieldsValue({ penalty });
  };

  useEffect(() => {
    if (open && initialValues) {
      const today = dayjs();
      const dueDate = dayjs(initialValues.due_date);
      const daysLate =
        dueDate.isValid() && today.isAfter(dueDate, "day")
          ? today.startOf("day").diff(dueDate.startOf("day"), "day")
          : 0;

      form.setFieldsValue({
        name: initialValues.borrower_name,
        bookTitle: initialValues.title,
        penalty: daysLate * 10,
        inCash: 0,
        returnedDate: today,
        violation: daysLate > 0 ? ["Late Return"] : [],
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [initialValues, form, open]);

  const handleViolationChange = () => {
    recalculatePenalty();
  };

  const handleReturnedDateChange = (date) => {
    form.setFieldsValue({ returnedDate: date });
    recalculatePenalty();
  };

  const handleFinish = async (values) => {
    if (!initialValues?.borrow_id || !initialValues?.book_id) {
      messageApi.error("Missing borrowing or book information.");
      return;
    }

    const returnedDate = values.returnedDate;
    const violations = Array.isArray(values.violation)
      ? values.violation
      : [];

    const amountPaid = Number(values.inCash ?? 0);
    const penalty = Number(values.penalty ?? 0);

    if (!returnedDate || !returnedDate.isValid()) {
      messageApi.error("Returned date is required.");
      return;
    }

    if (amountPaid < 0) {
      messageApi.error("Amount paid cannot be negative.");
      return;
    }

    if (violations.length > 0 && amountPaid < penalty) {
      messageApi.error("Amount paid must cover the penalty.");
      return;
    }

    try {
      const normalizedViolations = violations.length ? violations : ["None"];

      const payload = {
        borrow_id: initialValues.borrow_id,
        returned_date: returnedDate.format("YYYY-MM-DD"),
        violation: normalizedViolations,
        penalty,
        amount_paid: amountPaid,
      };

      const status = normalizedViolations.includes("Lost")
        ? "Lost"
        : "Returned";

      await axios.put(
        `http://localhost:8000/api/borrowed-books/${initialValues.borrow_id}`,
        { status },
        { headers: { "Content-Type": "application/json" } }
      );

      await axios.post(
        "http://localhost:8000/api/returned-books",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (status !== "Lost") {
        await axios.put(
          `http://localhost:8000/api/books/${initialValues.book_id}`,
          { incrementAvailable: 1 },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      messageApi.success(
        status === "Lost"
          ? "Book marked as lost!"
          : "Book returned successfully!"
      );

      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error while returning book:", err);

      messageApi.error(
        err.response?.data?.error ||
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
                  parser={(v) => (v || "").replace(/₱\s?|(,*)/g, "")}
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
                    const borrowDate = dayjs(initialValues?.date_borrowed);

                    return (
                      current &&
                      borrowDate.isValid() &&
                      current.isBefore(borrowDate, "day")
                    );
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
                shouldUpdate={(prev, curr) =>
                  prev.violation !== curr.violation
                }
              >
                {({ getFieldValue }) => {
                  const violations = getFieldValue("violation") || [];
                  const hasViolation = violations.length > 0;

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
                          type: "number",
                          min: 0,
                          message: "Amount paid cannot be negative.",
                        },
                        {
                          validator: (_, value) => {
                            const currentPenalty =
                              Number(form.getFieldValue("penalty")) || 0;

                            if (
                              !hasViolation ||
                              value == null ||
                              Number(value) >= currentPenalty
                            ) {
                              return Promise.resolve();
                            }

                            return Promise.reject(
                              new Error(
                                "Amount paid must cover the penalty."
                              )
                            );
                          },
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
                        parser={(v) => (v || "").replace(/₱\s?|(,*)/g, "")}
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