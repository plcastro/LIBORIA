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
      const data = await response.json();

      if (response.ok) {
        setRecords(data);
      } else {
        message.error(data.error || "Failed to fetch records");
      }
    } catch (err) {
      message.error("Network error. Please try again.");
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
    },
    {
      title: "Borrowed Date",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
      width: 120,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
    },
    {
      title: "Returned Date",
      dataIndex: "returned_date",
      key: "returned_date",
      width: 120,
      render: (date) => date || "-",
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
            color: !penalty || penalty === "0.00" ? "#52c41a" : "#ff4d4f",
            fontWeight: "bold",
          }}
        >
          ${penalty || "0.00"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status, record) => {
        const isReturned = record.returned_date;
        const currentStatus = status || (isReturned ? "Returned" : "Borrowed");

        return (
          <Tag
            color={currentStatus === "Returned" ? "blue" : "orange"}
            style={{ margin: 0 }}
          >
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
              placeholder="Search records"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ height: 40 }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRecords.map((record) => ({
            ...record,
            key: record.id,
          }))}
          pagination={false}
          scroll={{
            y: records.length > 10 ? 600 : undefined,
            x: "max-content",
          }}
          locale={{
            emptyText: "No records found",
          }}
        />
      </Card>
    </div>
  );
};
export default ViewRecords;
