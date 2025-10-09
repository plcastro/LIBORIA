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
} from "antd";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Year Level",
    dataIndex: "yrlvl",
    key: "yrlvl",
  },
  {
    title: "Course",
    key: "course",
    dataIndex: "course",
    render: (_, { course }) => (
      <>
        {course.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "BSIT-MWA") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Book Title",
    dataIndex: "book_title",
    key: "book_title",
  },
  {
    title: "Date Borrowed",
    dataIndex: "date_borrowed",
    key: "date_borrowed",
  },
  {
    title: "Due Date",
    dataIndex: "due_date",
    key: "due_date",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record, { handleReturn }) => (
      <Space size="middle">
        <Button type="primary" danger onClick={() => handleReturn(record)}>
          Return
        </Button>
      </Space>
    ),
  },
];
//sample data
const data = [
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
];

const reasonOptions = [
  { value: "Late Return", label: "Late Return" },
  { value: "Damaged", label: "Damaged" },
  { value: "Lost Book", label: "Lost Book" },
];

const ReturnBooks = () => {
  const [componentSize, setComponentSize] = useState("default");
  const [form] = Form.useForm();
  const [selectedBook, setSelectedBook] = useState(null);

  const LATE_RATE_PER_DAY = 10;
  const DAMAGED_FEE = 50;
  const LOST_FEE = 200;

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const calculateLatePenalty = (dueDate) => {
    const today = dayjs().startOf("day");
    const due = dayjs(dueDate, "MMM D, YYYY").startOf("day");

    if (today.isSameOrBefore(due)) {
      return 0;
    }

    const overdueDays = today.diff(due, "days");
    return overdueDays * LATE_RATE_PER_DAY;
  };

  const handleReason = (selectedReasons) => {
    let totalPenalty = 0;

    if (selectedReasons.includes("Late Return") && selectedBook) {
      totalPenalty += calculateLatePenalty(selectedBook.due_date);
    }

    if (selectedReasons.includes("Damaged")) {
      totalPenalty += DAMAGED_FEE;
    }

    if (selectedReasons.includes("Lost Book")) {
      totalPenalty += LOST_FEE;
    }

    form.setFieldsValue({
      penalty: totalPenalty,
    });
  };

  const handleReturn = (record) => {
    const currentDate = dayjs();

    setSelectedBook(record);

    form.setFieldsValue({
      name: record.name,
      bookTitle: record.book_title,
      returnedDate: currentDate,
      penalty: 0,
      violation: [],
    });
  };

  const colProps = { xs: 24, md: 12 };

  const columnsWithHandler = columns.map((col) => {
    if (col.key === "action") {
      return {
        ...col,
        render: (text, record) => col.render(text, record, { handleReturn }),
      };
    }
    return col;
  });

  return (
    <>
      <Table columns={columnsWithHandler} dataSource={data} />

      <Form
        form={form}
        id="return-form-id"
        layout="vertical"
        initialValues={{ size: componentSize }}
        onValuesChange={onFormLayoutChange}
        size={componentSize}
        style={{
          maxWidth: 800,
          width: "100%",
          backgroundColor: "white",
          boxShadow: " 0 5px 15px rgba(0, 0, 0, 0.1)",
          borderRadius: 20,
          padding: "20px",
        }}
      >
        <Row gutter={[24, 8]} className="return-book-form">
          <Col {...colProps}>
            <Form.Item label="Name" name="name">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col {...colProps}>
            <Form.Item label="Penalty (PHP)" name="penalty">
              <InputNumber
                style={{ width: "100%" }}
                // Disabled since this value is calculated by the system
                disabled
                formatter={(value) =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
                min={0}
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
                formatter={(value) =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
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
                style={{ width: "100%" }}
                placeholder="Select Reason"
                onChange={handleReason} // Triggers penalty calculation
                options={reasonOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify={"center"} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#000",
                    color: "white",
                    height: 40,
                  }}
                >
                  Return
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  htmlType="button"
                  style={{
                    width: "100%",
                    height: 40,
                  }}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ReturnBooks;
