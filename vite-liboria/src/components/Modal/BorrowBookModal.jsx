import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";

const BorrowBookModal = ({ open, onClose, onSubmit, initialValues }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { Option } = Select;
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

  // 🔍 Auto-fill borrower details if they already exist
  const handleNameBlur = async () => {
    const name = form.getFieldValue("name")?.trim();
    if (!name) return;

    try {
      const res = await fetch("http://localhost:8000/api/borrowers");
      if (!res.ok) throw new Error("Failed to fetch borrowers");
      const borrowers = await res.json();

      const borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      if (borrower) {
        form.setFieldsValue({
          year_level: borrower.year_level,
          course: borrower.course,
        });
        messageApi.info("Borrower found — auto-filled details.");
      } else {
        form.setFieldsValue({
          year_level: "",
          course: "",
        });
        messageApi.warning("New borrower detected — please fill out details.");
      }
    } catch (err) {
      console.error("Error fetching borrower:", err);
    }
  };

  const handleBorrow = async () => {
    try {
      const values = await form.validateFields();
      const name = values.name.trim();

      const borrowerPayload = {
        name,
        year_level: values.year_level,
        course: values.course,
        created_at: dayjs(values.created_at).format("YYYY-MM-DD"),
      };

      // Fetch existing borrowers
      const borrowersRes = await fetch("http://localhost:8000/api/borrowers");
      if (!borrowersRes.ok) throw new Error("Failed to fetch borrowers");
      const borrowers = await borrowersRes.json();

      // Check if borrower exists
      let borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      // Create borrower if not existing
      if (!borrower) {
        const createRes = await fetch("http://localhost:8000/api/borrowers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(borrowerPayload),
        });

        if (!createRes.ok) {
          const errorData = await createRes.json();
          console.error("Borrower creation failed:", errorData.error);
          return;
        }

        borrower = await createRes.json();
      }

      // Borrow payload
      const borrowPayload = {
        borrower_id: borrower.borrower_id,
        book_id: initialValues.book_id,
        date_borrowed: dayjs(values.created_at).format("YYYY-MM-DD"),
        due_date: dayjs(values.due_date).format("YYYY-MM-DD"),
        status: "Borrowed",
      };

      // Insert borrow record
      const borrowRes = await fetch(
        "http://localhost:8000/api/borrowed-books",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(borrowPayload),
        }
      );

      const borrowData = await borrowRes.json();

      if (borrowRes.ok) {
        onSubmit(borrowData);
        onClose();
        form.resetFields();
        messageApi.success(
          "Borrowed " + initialValues.book_title + " successfully!"
        );
        window.location.reload();
      } else {
        console.error("Borrow failed:", borrowData.error);
        if (borrowData.error.includes("already borrowed")) {
          messageApi.error("Student already borrowed this book!");
        } else if (borrowData.error.includes("limit reached")) {
          messageApi.error(
            "Borrow limit reached. You can only borrow up to 3 books at a time."
          );
        } else {
          messageApi.error("Failed to borrow book. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error while borrowing:", err);
    }
  };

  // Limit 14 days
  const disabledDate = (current) => {
    const borrowDate = form.getFieldValue("created_at") || dayjs();
    const minDate = borrowDate.add(1, "day");
    const maxDate = borrowDate.add(14, "day");
    return (
      current &&
      (current.isBefore(minDate, "day") || current.isAfter(maxDate, "day"))
    );
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Borrow Book"
        open={open}
        onCancel={onClose}
        footer={
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              form={form}
              onClick={handleBorrow}
            >
              Borrow
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={[24, 8]}>
            <Col {...colProps}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input onBlur={handleNameBlur} autoComplete="off" />
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
    </>
  );
};

export default BorrowBookModal;
