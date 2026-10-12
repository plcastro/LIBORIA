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
import axios from "axios";
const BorrowBookModal = ({ open, onClose, onSubmit, initialValues }) => {
  const [messageApi, contextHolder] = message.useMessage();
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

  const handleNameBlur = async () => {
    const name = formData.name.trim();
    if (!name) return;

    try {
      const { data: borrowers } = await axios.get(
        "http://localhost:8000/api/borrowers",
      );

      const borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase(),
      );

      if (borrower) {
        setFormData((prev) => ({
          ...prev,
          year_level: borrower.year_level,
          course: borrower.course,
        }));
        notify("info", "Borrower found - auto-filled details.");
      } else {
        setFormData((prev) => ({ ...prev, year_level: "", course: "" }));
        notify("warning", "New borrower detected - please fill out details.");
      }
    } catch (err) {
      console.error("Error fetching borrower:", err);
    }
  };
  const handleBorrow = async () => {
    if (!validate()) return;

    try {
      const name = formData.name.trim();
      const borrowerPayload = {
        name,
        year_level: formData.year_level,
        course: formData.course,
        created_at: dateValue(formData.created_at).format("YYYY-MM-DD"),
      };

      const { data: borrowers } = await axios.get(
        "http://localhost:8000/api/borrowers",
      );

      let borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase(),
      );

      if (!borrower) {
        try {
          const { data } = await axios.post(
            "http://localhost:8000/api/borrowers",
            borrowerPayload,
            { headers: { "Content-Type": "application/json" } },
          );
          borrower = data;
        } catch (error) {
          console.error(
            "Borrower creation failed:",
            error.response?.data?.error,
          );
          return;
        }
      }

      const borrowPayload = {
        borrower_id: borrower.borrower_id,
        book_id: initialValues.book_id,
        date_borrowed: dateValue(formData.created_at).format("YYYY-MM-DD"),
        due_date: dateValue(formData.due_date).format("YYYY-MM-DD"),
        status: "Borrowed",
      };

      const borrowRes = await axios.post(
        "http://localhost:8000/api/borrowed-books",
        borrowPayload,
        { headers: { "Content-Type": "application/json" } },
      );

      onSubmit(borrowRes.data);
      onClose();
      setFormData(initialForm);
      notify("success", `Borrowed ${initialValues.book_title} successfully!`);
      window.location.reload();
    } catch (err) {
      console.error("Error while borrowing:", err);
      const errorMessage = err.response?.data?.error || "";
      if (errorMessage.includes("already borrowed")) {
        notify("error", "Student already borrowed this book!");
      } else if (errorMessage.includes("limit reached")) {
        notify(
          "error",
          "Borrow limit reached. You can only borrow up to 3 books at a time.",
        );
      } else {
        notify("error", "Failed to borrow book. Please try again.");
      }
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
                <Select
                  placeholder="Select year level"
                  defaultValue="1st Year"
                  options={[
                    { value: "1st Year", label: "1st Year" },
                    { value: "2nd Year", label: "2nd Year" },
                    { value: "3rd Year", label: "3rd Year" },
                    { value: "4th Year", label: "4th Year" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item
                name="course"
                label="Course"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select course"
                  defaultValue="BS Information Technology"
                  options={[
                    {
                      value: "BS Information Technology",
                      label: "BS Information Technology",
                    },
                    {
                      value: "BS Tourism Management",
                      label: "BS Tourism Management",
                    },
                    { value: "BS Psychology", label: "BS Psychology" },
                    { value: "BS Nursing", label: "BS Nursing" },
                    {
                      value: "BS Medical Technology",
                      label: "BS Medical Technology",
                    },
                  ]}
                />
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
