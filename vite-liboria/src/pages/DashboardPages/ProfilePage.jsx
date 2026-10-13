import Button from "../../components/MuiButton.jsx";
import { useCallback, useEffect, useState } from "react";
import { Alert, Avatar, Card, Col, Divider, Empty, Form, Input, message, Row, Skeleton, Tag } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import api from "../../api";

const cardStyle = {
  display: "flex", alignItems: "center", justifyContent: "center",
  maxWidth: 450, width: "100%", margin: "3% auto",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.34)",
};

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isStudent = location.pathname.startsWith("/student/");
  const isEditing = isStudent && location.pathname.endsWith("/edit");
  const basePath = isStudent ? "/student/profile" : "/dashboard/view/profile";
  const [user, setUser] = useState(null);
  const [borrower, setBorrower] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const storedUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
  const currentUserId = storedUser?._id;

  const loadProfile = useCallback(async () => {
    if (!currentUserId) { setError("Your session was not found. Please log in again."); setLoading(false); return; }
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      api.get(`/users/${currentUserId}`),
      ...(isStudent ? [api.get("/borrowers"), api.get("/borrow-requests/limit")] : []),
    ]);
    const [userResult, borrowerResult, usageResult] = results;
    if (userResult.status === "fulfilled") {
      const nextUser = userResult.value.data;
      setUser(nextUser);
      form.setFieldsValue({ name: nextUser.name, email: nextUser.email, username: nextUser.username });
    } else {
      console.error("Unable to load profile:", userResult.reason.response?.status, userResult.reason.response?.data || userResult.reason);
      setError(userResult.reason.response?.data?.error || "Unable to load your profile.");
    }
    if (isStudent) {
      if (borrowerResult.status === "fulfilled") {
        const list = Array.isArray(borrowerResult.value.data) ? borrowerResult.value.data : borrowerResult.value.data.borrowers || [];
        setBorrower(list.find((item) => String(item.user_id) === String(currentUserId)) || null);
      } else console.error("Unable to load borrower:", borrowerResult.reason.response?.status, borrowerResult.reason.response?.data || borrowerResult.reason);
      if (usageResult.status === "fulfilled") setUsage(usageResult.value.data);
      else console.error("Unable to load borrow usage:", usageResult.reason.response?.status, usageResult.reason.response?.data || usageResult.reason);
    }
    setLoading(false);
  }, [currentUserId, form, isStudent]);

  useEffect(() => { Promise.resolve().then(() => loadProfile()); }, [loadProfile]);
  useEffect(() => {
    const handleUserUpdate = (event) => setUser(event.detail);
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const saveDetails = async (values) => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", values);
      setUser(data);
      sessionStorage.setItem("currentUser", JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("userUpdated", { detail: data }));
      messageApi.success("Profile updated successfully.");
      navigate(basePath);
    } catch (err) {
      messageApi.error(err.response?.data?.error || "Unable to update your profile.");
    } finally { setSaving(false); }
  };

  return <>
    {contextHolder}
    {loading ? <Card style={cardStyle}><Skeleton active /></Card> : error ? (
      <Card style={cardStyle}><Alert type="error" showIcon message={error} action={<Button onClick={loadProfile}>Retry</Button>} /></Card>
    ) : !user ? <Card style={cardStyle}><Empty description="Profile unavailable" /></Card> : isEditing ? (
      <Card title="Edit Profile" style={cardStyle}>
        <Form form={form} layout="vertical" onFinish={saveDetails} style={{ width: "100%" }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }, { max: 50 }, { pattern: /^[A-Za-z\s]+$/, message: "Name should only contain letters and spaces." }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Please input a valid email." }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true }, { min: 8 }, { pattern: /^[A-Za-z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores." }]}>
            <Input />
          </Form.Item>
          <Row gutter={8}>
            <Col><Button type="primary" htmlType="submit" loading={saving}>Save Changes</Button></Col>
            <Col><Button onClick={() => navigate(basePath)}>Back</Button></Col>
          </Row>
        </Form>
      </Card>
    ) : <Card style={cardStyle}>
      <Row style={{ textAlign: "center", marginBottom: 20 }}><Col span={24}>
        <Avatar size={128} icon={<UserOutlined />} />
        <p style={{ marginTop: 20 }}>{user.username}</p>
      </Col></Row>
      <Divider>Personal Information</Divider>
      <Row style={{ textAlign: "left" }}><Col>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {isStudent ? <Tag color="processing">{user.account_type}</Tag> : user.account_type}</p>
        {isStudent && borrower && <>
          {borrower.year_level && <p><strong>Year Level:</strong> {borrower.year_level}</p>}
          {borrower.course && <p><strong>Course:</strong> {borrower.course}</p>}
        </>}
        {isStudent && usage && <p><strong>Books Used:</strong> {usage.used} of {usage.limit} ({usage.active} active, {usage.pending} pending)</p>}
      </Col></Row>
      {isStudent && <Row justify="center" style={{ marginTop: 20 }}><Col span={24} style={{ textAlign: "center" }}>
        <Button type="primary" block onClick={() => navigate(`${basePath}/edit`)}>Edit Profile</Button>
      </Col></Row>}
      <Row justify="center" style={{ marginTop: 20 }}><Col span={24} style={{ textAlign: "center" }}>
        <Button icon={<EditOutlined />} style={{ width: "100%", backgroundColor: "#000", color: "#fff" }} onClick={() => setIsModalOpen(true)}>Change Password</Button>
      </Col></Row>
    </Card>}
    <EditProfile initialData={user || {}} isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={loadProfile} />
  </>;
};

export default ProfilePage;
