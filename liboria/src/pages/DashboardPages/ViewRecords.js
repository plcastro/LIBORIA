import React, { useState, useEffect } from "react";
import {
  Input,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  message,
  Spin,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ViewRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch records from the database
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/records");
      if (!response.ok) throw new Error("Failed to fetch records");

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status, returnedDate) => {
    if (returnedDate) return "green";
    if (status === "Borrowed") return "blue";
    if (status === "Returned") return "green";
    return "orange";
  };

  const getStatusText = (status, returnedDate) => {
    if (returnedDate) return "Returned";
    return status || "Borrowed";
  };

  const columns = [
    {
      title: "Borrow ID",
      dataIndex: "borrow_id",
      key: "borrow_id",
      width: 100,
    },
    {
      title: "Borrower Name",
      dataIndex: "borrower_name",
      key: "borrower_name",
      width: 150,
    },
    {
      title: "Year Level",
      dataIndex: "year_level",
      key: "year_level",
      width: 120,
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      width: 150,
    },
    {
      title: "Book Title",
      dataIndex: "book_title",
      key: "book_title",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Author",
      dataIndex: "author_name",
      key: "author_name",
      width: 150,
    },
    {
      title: "Borrowed Date",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Returned Date",
      dataIndex: "returned_date",
      key: "returned_date",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Violation",
      dataIndex: "violation",
      key: "violation",
      width: 130,
      render: (violation) => (
        <Tag
          color={violation === "None" || !violation ? "green" : "red"}
          style={{ margin: 0 }}
        >
          {violation || "None"}
        </Tag>
      ),
    },
    {
      title: "Penalty",
      dataIndex: "penalty",
      key: "penalty",
      width: 100,
      render: (penalty) => (
        <span
          style={{
            color:
              !penalty || penalty === "0.00" || penalty === 0
                ? "#52c41a"
                : "#ff4d4f",
            fontWeight: "bold",
          }}
        >
          ₱{penalty || "0.00"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status, record) => {
        const currentStatus = getStatusText(status, record.returned_date);
        const color = getStatusColor(status, record.returned_date);

        return (
          <Tag color={color} style={{ margin: 0 }}>
            {currentStatus}
          </Tag>
        );
      },
    },
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleReset = () => {
    setSearchTerm("");
    fetchRecords();
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Card>
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: "20px" }}
        >
          <Col xs={24} sm={12} md={10} lg={5}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ height: 40 }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={10} lg={5}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRecords}
              loading={loading}
              style={{ width: "100%", height: 40 }}
            >
              Refresh Records
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRecords.map((record) => ({
            ...record,
            key: record.borrow_id, // Use borrow_id as key instead of id
          }))}
          loading={loading}
          pagination={false}
          scroll={{
            y: filteredRecords.length > 10 ? 650 : undefined,
            x: "max-content",
          }}
          locale={{
            emptyText: loading ? <Spin size="large" /> : "No records found",
          }}
        />
      </Card>
    </div>
  );
};

export default ViewRecords;
