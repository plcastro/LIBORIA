import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  InputAdornment,
  TextField,
  Button,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { API_BASE_URL } from "../../utils/API_BASE";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";

import AddBookModal from "../../components/Modal/AddBookModal";
import EditBookModal from "../../components/Modal/EditBookModal";
import DeleteBookModal from "../../components/Modal/DeleteBookModal";
import BorrowBookModal from "../../components/Modal/BorrowBookModal";
import "../../App.css";

const DisplayBook = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseMessage = (_, reason) => {
    if (reason === "clickaway") return;

    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(API_BASE_URL + "/api/books");
      setBooks(data);
    } catch (err) {
      console.error(err);
      showMessage("Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books on search
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredBooks(books);
    } else {
      const query = searchValue.toLowerCase();

      const filtered = books.filter((book) =>
        Object.values(book).some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(query),
        ),
      );

      setFilteredBooks(filtered);
    }

    setPage(0);
  }, [searchValue, books]);

  // Open delete modal
  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async (book) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/books/${book.book_id}`);

      setBooks((prev) => prev.filter((b) => b.book_id !== book.book_id));

      showMessage("Book deleted successfully");
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleUpdateBook = (book) => {
    setSelectedBook(book);
    setEditModalOpen(true);
  };

  const handleBorrow = (book) => {
    setSelectedBook(book);
    setBorrowModalOpen(true);
  };

  const handleBookCreated = () => {
    fetchBooks();
    setAddModalOpen(false);
    showMessage("Book added successfully");
  };

  const handleBookUpdated = () => {
    fetchBooks();
    setEditModalOpen(false);
    showMessage("Book updated successfully");
  };

  const handleBookBorrowed = () => {
    fetchBooks();
    setBorrowModalOpen(false);
    showMessage("Book borrowed successfully");
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedBooks = filteredBooks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 1,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Search and Add Book */}
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 2,
            mb: 1.5,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search book"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
            sx={{
              width: {
                xs: "100%",
                sm: 300,
              },
              height: 40,
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{
              backgroundColor: "#1600a3",
              height: 40,
              px: 2,
              fontWeight: 500,
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "#000000",
              },
            }}
          >
            Add Book
          </Button>
        </Box>

        <TableContainer
          sx={{
            maxHeight: "75vh",
            width: "100%",
          }}
        >
          <Table
            stickyHeader
            sx={{
              minWidth: 1100,
              "& .MuiTableCell-root": {
                verticalAlign: "middle",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 150, fontWeight: 600 }}>_</TableCell>

                <TableCell sx={{ width: 250, fontWeight: 600 }}>
                  Book Title
                </TableCell>

                <TableCell sx={{ width: 200, fontWeight: 600 }}>
                  Author Name
                </TableCell>

                <TableCell sx={{ width: 150, fontWeight: 600 }}>
                  Category
                </TableCell>

                <TableCell align="center" sx={{ width: 150, fontWeight: 600 }}>
                  Total Copies
                </TableCell>

                <TableCell align="center" sx={{ width: 150, fontWeight: 600 }}>
                  Available Copies
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 300 }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : displayedBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    No books found.
                  </TableCell>
                </TableRow>
              ) : (
                displayedBooks.map((record) => (
                  <TableRow key={record.book_id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={record.image || "https://via.placeholder.com/60"}
                        alt={record.title || "Book cover"}
                        sx={{
                          width: 100,
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 1,
                          display: "block",
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {record.title}
                    </TableCell>

                    <TableCell>{record.author_name}</TableCell>

                    <TableCell>{record.category}</TableCell>

                    <TableCell align="center">{record.total_copies}</TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        color:
                          record.available_copies === 0 ? "#ff4d4f" : "#52c41a",
                        fontWeight:
                          record.available_copies === 0 ? "bold" : "normal",
                      }}
                    >
                      {record.available_copies}
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          disabled={record.available_copies === 0}
                          onClick={() => handleBorrow(record)}
                          sx={{
                            backgroundColor:
                              record.available_copies === 0
                                ? "#999"
                                : "#009148",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              backgroundColor: "#00783b",
                            },
                            "&.Mui-disabled": {
                              backgroundColor: "#999",
                              color: "#fff",
                            },
                          }}
                        >
                          {record.available_copies === 0
                            ? "Unavailable"
                            : "Borrow"}
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleUpdateBook(record)}
                          sx={{
                            backgroundColor: "#002ae6",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              backgroundColor: "#001fbd",
                            },
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDeleteBook(record)}
                          sx={{
                            backgroundColor: "#ff4d4f",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              backgroundColor: "#d9363e",
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredBooks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[3, 5, 10, 25]}
          labelRowsPerPage="Rows per page:"
        />

        {/* Modals */}
        <AddBookModal
          modal2Open={addModalOpen}
          setModal2Open={setAddModalOpen}
          onBookCreated={handleBookCreated}
        />

        {selectedBook && (
          <EditBookModal
            modalOpen={editModalOpen}
            setModalOpen={setEditModalOpen}
            book={selectedBook}
            onBookUpdated={handleBookUpdated}
          />
        )}

        {selectedBook && (
          <BorrowBookModal
            open={borrowModalOpen}
            onClose={() => setBorrowModalOpen(false)}
            initialValues={{
              ...selectedBook,
              book_title: selectedBook.title,
            }}
            onSubmit={async () => {
              await handleBookBorrowed();
            }}
          />
        )}

        {selectedBook && (
          <DeleteBookModal
            open={deleteModalOpen}
            setOpen={setDeleteModalOpen}
            book={selectedBook}
            onDelete={handleConfirmDelete}
          />
        )}
      </Paper>

      {/* MUI notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseMessage}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DisplayBook;
