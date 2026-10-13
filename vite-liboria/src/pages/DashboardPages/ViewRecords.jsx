import Table from "../../components/MuiTable.jsx";
import Button from "../../components/MuiButton.jsx";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Input, Tag, Card, Row, Col, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "../../api";
const ViewRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch records from the database
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/records");

      if (!Array.isArray(data)) {
        throw new Error("Invalid records response");
      }

      setRecords(data);
    } catch (err) {
      console.error("Error fetching records:", err);

      const errorMessage = "Failed to fetch records. Please try again.";

      setError(errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    Promise.resolve().then(() => fetchRecords());
  }, [fetchRecords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredRecords = useMemo(() => {
    if (!debouncedSearch) return records;

    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(debouncedSearch),
      ),
    );
  }, [records, debouncedSearch]);

  const columns = [
    {
      title: "Borrow ID",
      dataIndex: "borrow_id",
      key: "borrow_id",
      width: 120,
    },
    {
      title: "Borrower Name",
      dataIndex: "borrower_name",
      key: "borrower_name",
      width: 150,
    },
    {
      title: "Book Title",
      dataIndex: "book_title",
      key: "book_title",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <span
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
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
      width: 150,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 150,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Returned Date",
      dataIndex: "returned_date",
      key: "returned_date",
      width: 150,
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
            color: !penalty || Number(penalty) === 0 ? "#52c41a" : "#ff4d4f",
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
        const isReturned = record.returned_date;

        const currentStatus = status || (isReturned ? "Returned" : "Borrowed");

        let tagColor = "orange";

        if (currentStatus === "Returned") {
          tagColor = "green";
        } else if (currentStatus === "Borrowed") {
          tagColor = "blue";
        }

        return (
          <Tag color={tagColor} style={{ margin: 0 }}>
            {currentStatus}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {contextHolder}

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
              allowClear
            />
          </Col>
        </Row>

        {error && (
          <div
            role="alert"
            style={{
              color: "#ff4d4f",
              marginBottom: 16,
            }}
          >
            {error}

            <Button type="link" onClick={fetchRecords} disabled={loading}>
              Retry
            </Button>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredRecords.map((record, index) => ({
            ...record,
            key: record.borrow_id ?? record._id ?? index,
          }))}
          loading={loading}
          pagination={false}
          scroll={{
            y: filteredRecords.length > 10 ? "60vh" : undefined,
            x: "max-content",
          }}
          locale={{
            emptyText: error ? "Unable to load records" : "No records found",
          }}
        />
      </Card>
    </div>
  );
};

export default ViewRecords;
