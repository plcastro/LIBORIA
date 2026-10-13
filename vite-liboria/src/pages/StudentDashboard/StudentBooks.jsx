import { useEffect, useMemo, useState } from "react";
import axios from "../../api";
import {
  Avatar,
  Alert,
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
  TextField,
  Typography,
} from "@mui/material";
import { MenuBook, Search, ErrorIcon } from "@mui/icons-material";
import "./StudentBook.css";

const StudentBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`/books`);
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.books)
            ? data.books
            : [];

        if (active) setBooks(list);
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
  }, []);

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
        book.author,
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

      <Grid container spacing={1.5} className="student-books-filters">
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Search title, author, category, or ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                        {book.author || "Author unavailable"}
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
