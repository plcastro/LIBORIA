import { useEffect, useMemo, useState } from "react";
import axios from "../../api";
import {
  Avatar,
  Alert,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Tooltip,
  TextField,
  Typography,
} from "@mui/material";
import MenuBook from "@mui/icons-material/MenuBook";
import Search from "@mui/icons-material/Search";
import ErrorIcon from "@mui/icons-material/Error";
import "./StudentBook.css";

const getBookAuthor = (book) => book.author_name || book.author || "";

const StudentBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [requests, setRequests] = useState([]);
  const [activeBookIds, setActiveBookIds] = useState([]);
  const [usage, setUsage] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const userId = JSON.parse(sessionStorage.getItem("currentUser") || "null")?._id;

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const [booksResult, requestsResult, loansResult, limitResult] = await Promise.allSettled([
          axios.get("/books"),
          userId ? axios.get(`/borrow-requests/student/${userId}`) : Promise.resolve({ data: [] }),
          userId ? axios.get("/borrowed-books") : Promise.resolve({ data: [] }),
          userId ? axios.get("/borrow-requests/limit") : Promise.resolve({ data: null }),
        ]);
        if (!active) return;
        for (const [label, result] of [["books", booksResult], ["requests", requestsResult], ["loans", loansResult], ["limit", limitResult]]) {
          if (result.status === "rejected") console.error(`Unable to load ${label}:`, result.reason.response?.status, result.reason.response?.data || result.reason);
        }
        if (booksResult.status === "fulfilled") {
          const data = booksResult.value.data;
          setBooks(Array.isArray(data) ? data : data.books || []);
        } else setError("Unable to load books. Please try again.");
        if (requestsResult.status === "fulfilled") setRequests(requestsResult.value.data);
        if (loansResult.status === "fulfilled") setActiveBookIds(loansResult.value.data
          .filter((loan) => /^(borrowed|overdue)$/i.test(loan.status))
          .map((loan) => String(loan.book_id)));
        if (limitResult.status === "fulfilled") setUsage(limitResult.value.data);
      } catch (err) {
        console.error("Unable to load books:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load books. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBooks();

    return () => {
      active = false;
    };
  }, [userId]);

  const requestBook = async (bookId) => {
    setSubmitting(String(bookId));
    setError("");
    setFeedback("");
    try {
      const { data } = await axios.post("/borrow-requests", { user_id: userId, book_id: bookId });
      setRequests((current) => [data.request, ...current]);
      setUsage((current) => current ? { ...current, pending: current.pending + 1, used: current.used + 1 } : current);
      setFeedback("Borrow request submitted.");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to submit borrow request.");
    } finally {
      setSubmitting(null);
    }
  };

  const categories = useMemo(
    () =>
      [...new Set(books.map((book) => book.category).filter(Boolean))].sort(),
    [books],
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch = [
        book.title,
        getBookAuthor(book),
        book.category,
        book.isbn,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );

      const matchesCategory = category === "all" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  return (
    <div className="student-books">
      <div className="student-books-heading">
        <Typography variant="h3">Browse Books</Typography>
        <Typography variant="body1">
          Explore the library catalog and find your next read.
        </Typography>
        {usage && <Typography variant="body2">{usage.used} of {usage.limit} books used</Typography>}
      </div>

      {error && (
        <Alert
          icon={<ErrorIcon fontSize="inherit" />}
          severity="error"
          className="student-books-error"
        >
          {error}
        </Alert>
      )}
      {feedback && <Alert severity="success" onClose={() => setFeedback("")}>{feedback}</Alert>}

      <Grid container spacing={1.5} className="student-books-filters">
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Search title, author, category, or ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                height: 56,
              },
            }}
            slotProps={{
              input: {
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      sx={{
                        border: 0,
                        background: "transparent",
                        cursor: "pointer",
                        color: "text.secondary",
                        fontSize: 20,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </Box>
                  </InputAdornment>
                ) : null,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <Select
              size="medium"
              className="student-books-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Filter by category" }}
              sx={{
                height: 56,
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>

              {categories.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box>
          <Skeleton variant="text" width="35%" height={32} />
          <Grid container spacing={2} className="student-books-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={index}>
                <Card className="student-book-card">
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={28} />
                    <Skeleton variant="text" width="65%" />
                    <Skeleton variant="rounded" width={90} height={24} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : filteredBooks.length === 0 ? (
        <Box
          className="student-books-empty"
          sx={{ textAlign: "center", py: 6 }}
        >
          <Typography variant="body1" color="text.secondary">
            No books found
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            {filteredBooks.length} book(s) found
          </Typography>

          <Grid container spacing={2} className="student-books-grid">
            {filteredBooks.map((book, index) => {
              const id = book.book_id ?? book._id ?? index;
              const available = Number(book.available_copies);
              const author = getBookAuthor(book);
              const pending = requests.some((request) => String(request.book_id) === String(id) && request.status === "Pending");
              const borrowed = activeBookIds.includes(String(id));
              const atLimit = usage && usage.used >= usage.limit;

              const hasAvailability =
                book.available_copies !== undefined &&
                book.available_copies !== null &&
                Number.isFinite(available);

              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={id}>
                  <Card
                    className="student-book-card"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {book.image ? (
                      <CardMedia
                        component="img"
                        image={book.image}
                        alt={book.title || "Book cover"}
                        className="student-book-cover"
                      />
                    ) : (
                      <Box className="student-book-cover-placeholder">
                        <Avatar sx={{ width: 88, height: 88 }} variant="square">
                          <MenuBook sx={{ fontSize: 48 }} />
                        </Avatar>
                      </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        className="student-book-title"
                      >
                        {book.title || "Untitled"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        className="student-book-author"
                        sx={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                        }}
                      >
                        {author || "Author unavailable"}
                      </Typography>

                      {book.category && (
                        <Chip
                          label={book.category}
                          color="primary"
                          size="small"
                        />
                      )}

                      <Box className="student-book-availability">
                        {hasAvailability ? (
                          <Chip
                            color={available > 0 ? "success" : "error"}
                            size="small"
                            label={
                              available > 0
                                ? `${available} available`
                                : "Unavailable"
                            }
                          />
                        ) : (
                          <Chip label="Availability not listed" size="small" />
                        )}
                      </Box>
                      <Tooltip title={atLimit ? `Borrow limit reached (${usage.used} of ${usage.limit} books used)` : ""}>
                      <span><Button
                        variant="contained"
                        fullWidth
                        disabled={!userId || !hasAvailability || available <= 0 || pending || borrowed || atLimit || submitting === String(id)}
                        onClick={() => requestBook(id)}
                        sx={{ mt: 2, textTransform: "none" }}
                      >
                        {pending ? "Request pending" : borrowed ? "Already borrowed" : atLimit ? "Borrow limit reached" : "Request to borrow"}
                      </Button></span></Tooltip>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </div>
  );
};

export default StudentBooks;
