
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

      form.setFieldsValue({
        name: "",
        year_level: undefined,
        course: undefined,
        created_at: today,
        due_date: today.add(7, "day"),
        book_title: initialValues.book_title || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleNameBlur = async () => {
    const name = (form.getFieldValue("name") || "").trim();
    if (!name) return;

    try {
      const { data: borrowers } = await axios.get(
        "http://localhost:8000/api/borrowers"
      );

      const borrower = borrowers.find(
        (b) => b.name?.toLowerCase() === name.toLowerCase()
      );

      if (borrower) {
        form.setFieldsValue({
          year_level: borrower.year_level,
          course: borrower.course,
        });

        messageApi.info("Borrower found - auto-filled details.");
      } else {
        form.setFieldsValue({
          year_level: undefined,
          course: undefined,
        });

        messageApi.warning(
          "New borrower detected - please fill out details."
        );
      }
    } catch (err) {
      console.error("Error fetching borrower:", err);
      messageApi.error("Could not look up borrower details.");
    }
  };

  const handleBorrow = async () => {
    let values;

    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    if (!initialValues?.book_id) {
      messageApi.error("No book selected. Please select a book first.");
      return;
    }

    try {
      const name = values.name.trim();

      const borrowerPayload = {
        name,
        year_level: values.year_level,
        course: values.course,
        created_at: values.created_at.format("YYYY-MM-DD"),
      };

      const { data: borrowers } = await axios.get(
        "http://localhost:8000/api/borrowers"
      );

      let borrower = borrowers.find(
        (b) => b.name?.toLowerCase() === name.toLowerCase()
      );

      if (!borrower) {
        try {
          const { data } = await axios.post(
            "http://localhost:8000/api/borrowers",
            borrowerPayload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          borrower = data;
        } catch (error) {
          console.error("Borrower creation failed:", error);
          messageApi.error(
            error.response?.data?.error || "Failed to create borrower."
          );
          return;
        }
      }

      if (!borrower?.borrower_id) {
        messageApi.error(
          "Borrower ID was not returned by the server. Check the borrowers API response."
        );
        return;
      }

      const borrowPayload = {
        borrower_id: borrower.borrower_id,
        book_id: initialValues.book_id,
        date_borrowed: values.created_at.format("YYYY-MM-DD"),
        due_date: values.due_date.format("YYYY-MM-DD"),
        status: "Borrowed",
      };

      const borrowRes = await axios.post(
        "http://localhost:8000/api/borrowed-books",
        borrowPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (onSubmit) {
        onSubmit(borrowRes.data);
      }

      messageApi.success(
        `Borrowed ${initialValues.book_title || "book"} successfully!`
      );

      form.resetFields();
      onClose();

      window.location.reload();
    } catch (err) {
      console.error("Error while borrowing:", err);

      const errorMessage = err.response?.data?.error || "";

      if (errorMessage.toLowerCase().includes("already borrowed")) {
        messageApi.error("Student already borrowed this book!");
      } else if (errorMessage.toLowerCase().includes("limit reached")) {
        messageApi.error(
          "Borrow limit reached. You can only borrow up to 3 books at a time."
        );
      } else {
        messageApi.error(
          err.response?.data?.error ||
            "Failed to borrow book. Please try again."
        );
      }
    }
  };

  // Allow due dates from 1 to 14 days after the borrow date.
  const disabledDate = (current) => {
    const borrowDate = form.getFieldValue("created_at") || dayjs();
    const minDate = borrowDate.add(1, "day");
    const maxDate = borrowDate.add(14, "day");

    return (
      current &&
      (current.isBefore(minDate, "day") ||
        current.isAfter(maxDate, "day"))
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleBorrow}>
              Borrow
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={[24, 8]}>
            <Col {...colProps}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, whitespace: true, message: "Please enter a name." },
                ]}
              >
                <Input onBlur={handleNameBlur} autoComplete="off" />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item
                name="year_level"
                label="Year Level"
                rules={[{ required: true, message: "Please select a year level." }]}
              >
                <Select
                  placeholder="Select year level"
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
                rules={[{ required: true, message: "Please select a course." }]}
              >
                <Select
                  placeholder="Select course"
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
              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[{ required: true, message: "Please select a due date." }]}
              >
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