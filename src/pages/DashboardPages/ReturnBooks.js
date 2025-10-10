import React, { useState } from "react";
import {
  Button,
  Row,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const LATE_RATE_PER_DAY = 10;
const DAMAGED_FEE = 50;
const LOST_FEE = 200;

const { Link } = Typography;

const REASONS = [
  { value: "Late Return", label: "Late Return" },
  { value: "Damaged", label: "Damaged" },
  { value: "Lost Book", label: "Lost Book" },
];

const SAMPLE_DATA = [
  {
    key: "1",
    id: "1",
    name: "John Brown",
    yrlvl: "2nd Year",
    course: ["BSIT-MWA"],
    book_title: "Minecraft for dummies",
    date_borrowed: "Oct 2, 2025",
    due_date: "Oct 7, 2025",
  },
  {
    key: "2",
    id: "2",
    name: "John Brown",
    yrlvl: "2nd Year",
    course: ["BSIT-MWA"],
    book_title: "Minecraft for dummies",
    date_borrowed: "Oct 2, 2025",
    due_date: "Oct 7, 2025",
  },
  {
    key: "3",
    id: "3",
    name: "John Brown",
    yrlvl: "2nd Year",
    course: ["BSIT-MWA"],
    book_title: "Minecraft for dummies",
    date_borrowed: "Oct 2, 2025",
    due_date: "Oct 7, 2025",
  },
  {
    key: "4",
    id: "4",
    name: "John Brown",
    yrlvl: "2nd Year",
    course: ["BSIT-MWA"],
    book_title: "Minecraft for dummies",
    date_borrowed: "Oct 2, 2025",
    due_date: "Oct 7, 2025",
  },
  {
    key: "5",
    id: "5",
    name: "John Brown",
    yrlvl: "2nd Year",
    course: ["BSIT-MWA"],
    book_title: "Minecraft for dummies",
    date_borrowed: "Oct 2, 2025",
    due_date: "Oct 7, 2025",
  },
  {
    key: "6",
    id: "6",
    name: "John Brown",
    yrlvl: "2nd Year",
    course: ["BSIT-MWA"],
    book_title: "Minecraft for dummies",
    date_borrowed: "Oct 2, 2025",
    due_date: "Oct 7, 2025",
  },
];

const ReturnBooks = () => {
  const [form] = Form.useForm();
  const [selectedBook, setSelectedBook] = useState(null);
  const [size, setSize] = useState("default");

  const calculateLatePenalty = (dueDate) => {
    const today = dayjs().startOf("day");
    const due = dayjs(dueDate, "MMM D, YYYY").startOf("day");
    if (today.isSameOrBefore(due)) return 0;
    return today.diff(due, "days") * LATE_RATE_PER_DAY;
  };

  const handleReasonChange = (reasons) => {
    if (!selectedBook) return;
    let total = 0;

    if (reasons.includes("Late Return"))
      total += calculateLatePenalty(selectedBook.due_date);
    if (reasons.includes("Damaged")) total += DAMAGED_FEE;
    if (reasons.includes("Lost Book")) total += LOST_FEE;

    form.setFieldsValue({ penalty: total });
  };

  const handleReturn = (record) => {
    setSelectedBook(record);
    const currentDate = dayjs();
    const due = dayjs(record.due_date, "MMM D, YYYY");

    let initialViolation = [];
    let initialPenalty = 0;

    // Matic na magmamark Late Return if overdue
    if (currentDate.isAfter(due, "day")) {
      initialViolation.push("Late Return");
      initialPenalty += calculateLatePenalty(record.due_date);
    }

    form.setFieldsValue({
      name: record.name,
      bookTitle: record.book_title,
      returnedDate: currentDate,
      penalty: initialPenalty,
      violation: initialViolation,
      inCash: 0,
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Year Level", dataIndex: "yrlvl", key: "yrlvl" },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (course) =>
        course.map((tag) => (
          <Tag
            color={
              tag === "BSIT-MWA"
                ? "volcano"
                : tag.length > 5
                ? "geekblue"
                : "green"
            }
            key={tag}
          >
            {tag.toUpperCase()}
          </Tag>
        )),
    },
    { title: "Book Title", dataIndex: "book_title", key: "book_title" },
    {
      title: "Date Borrowed",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
    },
    { title: "Due Date", dataIndex: "due_date", key: "due_date" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Link onClick={() => handleReturn(record)} style={{ color: "red" }}>
          Return
        </Link>
      ),
    },
  ];

  const colProps = { xs: 24, md: 12 };

  return (
    <>
      <Table
        columns={columns}
        dataSource={SAMPLE_DATA}
        pagination={false}
        scroll={SAMPLE_DATA.length > 5 ? { y: 300 } : undefined}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{ size }}
        onValuesChange={({ size }) => setSize(size)}
        style={{
          maxWidth: 800,
          width: "100%",
          backgroundColor: "white",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          borderRadius: 20,
          padding: 20,
          margin: "15px auto",
        }}
      >
        <Row gutter={[24, 8]}>
          <Col {...colProps}>
            <Form.Item label="Name" name="name">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="Penalty (PHP)" name="penalty">
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
            <Form.Item label="Book Title" name="bookTitle">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="Amount Paid" name="inCash">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(v) =>
                  `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => v.replace(/₱\s?|(,*)/g, "")}
                min={0}
              />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="Returned Date" name="returnedDate">
              <DatePicker style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col {...colProps}>
            <Form.Item label="Violation" name="violation">
              <Select
                mode="tags"
                placeholder="Select Reason"
                onChange={handleReasonChange}
                options={REASONS}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  flex: 1,
                  backgroundColor: "#000",
                  color: "white",
                  height: 40,
                }}
              >
                Return
              </Button>
              <Button style={{ flex: 1, height: 40 }}>Cancel</Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ReturnBooks;
