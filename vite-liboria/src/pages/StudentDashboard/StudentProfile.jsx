import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Skeleton,
  Typography,
} from "antd";
import { ReloadOutlined, UserOutlined } from "@ant-design/icons";
import api from "../../api";

const formatAccountType = (accountType) =>
  String(accountType || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [borrowerId, setBorrowerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowerNotice, setBorrowerNotice] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setBorrowerNotice("");
      setProfile(null);
      setBorrowerId(null);

      const [profileResult, borrowerResult] = await Promise.allSettled([
        api.get("/users/me"),
        api.get("/borrowers"),
      ]);

      if (!active) return;

      if (profileResult.status === "rejected") {
        console.error("Unable to load student profile:", profileResult.reason);
        setError(
          profileResult.reason.response?.data?.error ||
            "Unable to load your profile. Please try again.",
        );
      } else {
        const user = profileResult.value.data?.user;
        if (!user) {
          setError("Profile information was not returned by the server.");
        } else {
          setProfile(user);
          sessionStorage.setItem("currentUser", JSON.stringify(user));
        }
      }

      if (borrowerResult.status === "rejected") {
        console.error("Unable to load student borrower ID:", borrowerResult.reason);
        setBorrowerNotice("Your borrower ID could not be loaded.");
      } else {
        const responseData = borrowerResult.value.data;
        const borrowers = Array.isArray(responseData)
          ? responseData
          : responseData?.borrowers || [];
        const currentUser =
          profileResult.status === "fulfilled"
            ? profileResult.value.data?.user
            : null;
        const linkedBorrowers = currentUser?._id
          ? borrowers.filter(
              (borrower) =>
                String(borrower.user_id) === String(currentUser._id),
            )
          : [];

        if (linkedBorrowers.length === 1) {
          setBorrowerId(linkedBorrowers[0].borrower_id);
        } else if (linkedBorrowers.length > 1) {
          setBorrowerNotice(
            "Multiple borrower records are linked to your account. Please contact the librarian.",
          );
        } else {
          setBorrowerNotice("No borrower ID is linked to your account.");
        }
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [retry]);

  const fields = profile
    ? [
        { label: "Student name", value: profile.name },
        { label: "Username", value: profile.username },
        { label: "Email address", value: profile.email },
        {
          label: "Account type",
          value: formatAccountType(profile.account_type),
        },
        { label: "Student ID", value: profile.userid },
        { label: "Borrower ID", value: borrowerId },
      ].filter(
        ({ value }) => value !== null && value !== undefined && value !== "",
      )
    : [];

  return (
    <div className="student-profile">
      <div className="student-profile-heading">
        <Typography.Title level={2}>My Profile</Typography.Title>
        <Typography.Paragraph>
          View the account information associated with your LIBORIA login.
        </Typography.Paragraph>
      </div>

      {loading ? (
        <Card className="student-profile-card">
          <Skeleton active avatar paragraph={{ rows: 5 }} />
        </Card>
      ) : error ? (
        <Alert
          className="student-profile-alert"
          type="error"
          showIcon
          message={error}
          action={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setRetry((current) => current + 1)}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <Card className="student-profile-card">
          <div className="student-profile-identity">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <Typography.Title level={4}>
                {profile.name || profile.username || "Profile"}
              </Typography.Title>
              {profile.username && (
                <Typography.Text type="secondary">
                  @{profile.username}
                </Typography.Text>
              )}
            </div>
          </div>

          {borrowerNotice && (
            <Alert
              className="student-profile-alert"
              type="info"
              showIcon
              message={borrowerNotice}
            />
          )}

          <Descriptions
            className="student-profile-details"
            title="Account information"
            column={{ xs: 1, sm: 1, md: 2 }}
            bordered
          >
            {fields.map(({ label, value }) => (
              <Descriptions.Item key={label} label={label}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default StudentProfile;
