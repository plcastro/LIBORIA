import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Typography,
  Box,
} from "@mui/material";

import { SearchOutlined as SearchIcon } from "../../components/MuiAntIcons";

const ViewRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Fetch records from the database
  const fetchRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("http://localhost:8000/api/records");

      if (!Array.isArray(data)) {
        throw new Error("Invalid records response");
      }

      setRecords(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  const getStatus = (status, record) => {
    return status || (record.returned_date ? "Returned" : "Borrowed");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Returned":
        return "success";
      case "Borrowed":
        return "info";
      default:
        return "warning";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Card elevation={2}>
        <CardContent>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Grid item xs={12} sm={8} md={5} lg={4}>
              <TextField
                placeholder="Search records"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  "aria-label": "Search records",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                  },
                }}
              />
            </Grid>
          </Grid>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <button
                  type="button"
                  onClick={fetchRecords}
                  style={{
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Retry
                </button>
              }
            >
              {error}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              stickyHeader
              aria-label="Borrowing records"
              sx={{
                minWidth: 1650,
                "& .MuiTableCell-head": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 120 }}>Borrow ID</TableCell>

                  <TableCell sx={{ minWidth: 150 }}>Borrower Name</TableCell>

                  <TableCell sx={{ minWidth: 120 }}>Year Level</TableCell>

                  <TableCell sx={{ minWidth: 150 }}>Course</TableCell>

                  <TableCell sx={{ minWidth: 200 }}>Book Title</TableCell>

                  <TableCell sx={{ minWidth: 150 }}>Author</TableCell>

                  <TableCell sx={{ minWidth: 150 }}>Borrowed Date</TableCell>

                  <TableCell sx={{ minWidth: 150 }}>Due Date</TableCell>

                  <TableCell sx={{ minWidth: 150 }}>Returned Date</TableCell>

                  <TableCell sx={{ minWidth: 130 }}>Violation</TableCell>

                  <TableCell sx={{ minWidth: 100 }}>Penalty</TableCell>

                  <TableCell sx={{ minWidth: 110 }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={30} />

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Loading records...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => {
                    const violation = record.violation;
                    const penalty = record.penalty;

                    const hasPenalty =
                      penalty != null &&
                      penalty !== "" &&
                      Number(penalty) !== 0;

                    const currentStatus = getStatus(record.status, record);

                    return (
                      <TableRow key={record.borrow_id} hover>
                        <TableCell>{record.borrow_id}</TableCell>

                        <TableCell>{record.borrower_name}</TableCell>

                        <TableCell>{record.year_level}</TableCell>

                        <TableCell>{record.course}</TableCell>

                        <TableCell
                          sx={{
                            whiteSpace: "normal",
                            overflowWrap: "anywhere",
                            maxWidth: 200,
                          }}
                        >
                          {record.book_title}
                        </TableCell>

                        <TableCell>{record.author_name}</TableCell>

                        <TableCell>
                          {formatDate(record.date_borrowed)}
                        </TableCell>

                        <TableCell>{formatDate(record.due_date)}</TableCell>

                        <TableCell>
                          {formatDate(record.returned_date)}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={violation || "None"}
                            color={
                              violation && violation !== "None"
                                ? "error"
                                : "success"
                            }
                            size="small"
                            sx={{
                              borderRadius: 1,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            component="span"
                            sx={{
                              color: hasPenalty ? "#ff4d4f" : "#52c41a",
                              fontWeight: "bold",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ₱
                            {penalty == null || penalty === ""
                              ? "0.00"
                              : Number(penalty).toFixed(2)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={currentStatus}
                            color={getStatusColor(currentStatus)}
                            size="small"
                            sx={{
                              borderRadius: 1,
                              fontWeight: 500,
                            }}
                          />
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

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewRecords;
