import Button from "../MuiButton.jsx";
import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import axios from "../../api";
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
        created_at: today,
        due_date: dueDate,
        book_title: initialValues.book_title || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleBorrow = async () => {
    try {
      const formData = await form.validateFields();
      const name = formData.name.trim();
      const borrowerPayload = {
        name,

        created_at: formData.created_at.format("YYYY-MM-DD"),
      };

      const { data: borrowers } = await axios.get("/borrowers");

      let borrower = borrowers.find(
        (b) => b.name.toLowerCase() === name.toLowerCase(),
      );

      if (!borrower) {
        try {
          const { data } = await axios.post("/borrowers", borrowerPayload, {
            headers: { "Content-Type": "application/json" },
          });
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
        date_borrowed: formData.created_at.format("YYYY-MM-DD"),
        due_date: formData.due_date.format("YYYY-MM-DD"),
        status: "Borrowed",
      };

      const borrowRes = await axios.post("/borrowed-books", borrowPayload, {
        headers: { "Content-Type": "application/json" },
      });

      onSubmit(borrowRes.data);
      onClose();
      form.resetFields();
      messageApi.success(`Borrowed ${initialValues.book_title} successfully!`);
    } catch (err) {
      console.error("Error while borrowing:", err);
      const errorMessage = err.response?.data?.error || "";
      if (errorMessage.includes("already borrowed")) {
        messageApi.error("Student already borrowed this book!");
      } else if (errorMessage.includes("limit reached")) {
        messageApi.error(errorMessage);
      } else {
        messageApi.error("Failed to borrow book. Please try again.");
      }
    }
  };

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
                <Input autoComplete="off" />
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
