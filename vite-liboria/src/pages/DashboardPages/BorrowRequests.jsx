import { useCallback, useEffect, useState } from "react";
import { Card, message, Select, Space, Tag } from "antd";
import api from "../../api";
import Table from "../../components/MuiTable.jsx";
import Button from "../../components/MuiButton.jsx";

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";

export default function BorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/borrow-requests");
      setRequests(data);
    } catch (err) {
      messageApi.error(err.response?.data?.error || "Unable to load borrow requests.");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => { Promise.resolve().then(() => loadRequests()); }, [loadRequests]);

  const review = async (request, action) => {
    setWorkingId(request.request_id);
    try {
      await api.put(`/borrow-requests/${request.request_id}/${action}`);
      messageApi.success(`Request ${action === "approve" ? "approved" : "rejected"}.`);
      await loadRequests();
    } catch (err) {
      messageApi.error(err.response?.data?.error || "Unable to review request.");
    } finally {
      setWorkingId(null);
    }
  };

  const visible = filter === "All" ? requests : requests.filter((request) => request.status === filter);
  const columns = [
    { title: "Student", dataIndex: "student_name", key: "student_name" },
    { title: "Book", dataIndex: "book_title", key: "book_title", render: (title, request) => title || `Book #${request.book_id}` },
    { title: "Requested", dataIndex: "requested_at", key: "requested_at", render: formatDate },
    { title: "Status", dataIndex: "status", key: "status", render: (status) => <Tag color={status === "Pending" ? "warning" : status === "Approved" ? "success" : "error"}>{status}</Tag> },
    { title: "Reason", dataIndex: "rejection_reason", key: "rejection_reason", render: (reason) => reason || "—" },
    { title: "Action", key: "action", render: (_, request) => request.status === "Pending" && (
      <Space>
        <Button type="primary" size="small" loading={workingId === request.request_id} onClick={() => review(request, "approve")}>Approve</Button>
        <Button danger size="small" disabled={workingId === request.request_id} onClick={() => review(request, "reject")}>Reject</Button>
      </Space>
    ) },
  ];

  return <Card title="Borrow Requests" extra={
    <Select value={filter} onChange={setFilter} style={{ width: 140 }} options={["Pending", "Approved", "Rejected", "All"].map((value) => ({ value, label: value }))} />
  }>
    {contextHolder}
    <Table rowKey="request_id" columns={columns} dataSource={visible} loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
  </Card>;
}
