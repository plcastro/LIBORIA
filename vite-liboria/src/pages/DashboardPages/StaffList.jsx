import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Alert,
  Snackbar,
  Grid,
  TextField,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  EditOutlined as EditIcon,
  PlusOutlined as AddIcon,
  SearchOutlined as SearchIcon,
} from "../../components/MuiAntIcons";

import StaffModal from "../../components/Modal/StaffModal";

const StaffList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const currentUserId = JSON.parse(
    localStorage.getItem("currentUser") || "null",
  )?.userid;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedStaff, setSelectedStaff] = useState(null);

  const showMessage = (message, severity = "error") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const loadAllStaff = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: result } = await axios.get("http://localhost:8000/api/users");

      if (Array.isArray(result)) {
        setData(
          result.map((item) => ({
            ...item,
            key: item.userid,
          })),
        );
      } else {
        setError(result.error || "Failed to load staff");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllStaff();
  }, []);

  const handleAddStaff = () => {
    setModalMode("add");
    setSelectedStaff(null);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      const { data: userData } = await axios.get(
        `http://localhost:8000/api/users/${record.userid}`,
      );

      setSelectedStaff(userData);
      setModalMode("edit");
      setModalVisible(true);
    } catch (err) {
      console.error(err);
      showMessage("Network error");
    }
  };

  const handleDelete = (record) => {
    setModalMode("delete");
    setSelectedStaff(record);
    setModalVisible(true);
  };

  const handleSave = () => {
    loadAllStaff();
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;

    const text = searchText.toLowerCase();

    return (
      item.name?.toLowerCase().includes(text) ||
      item.email?.toLowerCase().includes(text) ||
      item.username?.toLowerCase().includes(text) ||
      item.account_type?.toLowerCase().includes(text)
    );
  });

  return (
    <>
      <Card elevation={2}>
        <CardContent>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Grid item xs={12} sm={7} md={5} lg={4}>
              <TextField
                type="search"
                placeholder="Search data"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                }}
                inputProps={{
                  "aria-label": "Search staff",
                }}
                sx={{
                  maxWidth: 300,
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={5} md={4} lg={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddStaff}
                fullWidth
                sx={{
                  height: 40,
                  backgroundColor: "#1600a3",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#110080",
                  },
                }}
              >
                Add Staff
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ width: "100%", overflowX: "auto" }}
          >
            <Table
              stickyHeader
              size="medium"
              aria-label="Staff list"
              sx={{
                minWidth: 850,
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Loading staff...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No staff found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => {
                    const isCurrentUser =
                      String(record.userid) === String(currentUserId);

                    return (
                      <TableRow key={record.userid} hover>
                        <TableCell>{record.userid}</TableCell>

                        <TableCell>{record.name}</TableCell>

                        <TableCell>{record.email}</TableCell>

                        <TableCell>{record.account_type}</TableCell>

                        <TableCell>{record.username}</TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(record)}
                              sx={{
                                height: 30,
                                minWidth: 0,
                                backgroundColor: "black",
                                color: "white",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "#333",
                                },
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              variant="contained"
                              size="small"
                              disabled={isCurrentUser}
                              onClick={() => handleDelete(record)}
                              sx={{
                                height: 30,
                                minWidth: 0,
                                backgroundColor: "#ff4d4f",
                                color: "white",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "#d9363e",
                                },
                                "&.Mui-disabled": {
                                  backgroundColor: "#ccc",
                                  color: "#666",
                                },
                              }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <StaffModal
        isVisible={modalVisible}
        mode={modalMode}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        selectedStaff={selectedStaff}
        currentUserId={currentUserId}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() =>
            setNotification((prev) => ({
              ...prev,
              open: false,
            }))
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StaffList;
