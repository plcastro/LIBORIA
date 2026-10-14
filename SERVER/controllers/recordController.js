const { collection } = require("../config/database");

const getAllRecords = async (req, res) => {
  try {
    const borrowedBooks = await collection("borrowed_books");
    const results = await borrowedBooks
      .aggregate([
        {
          $lookup: {
            from: "books",
            localField: "book_id",
            foreignField: "book_id",
            as: "book",
          },
        },
        {
          $lookup: {
            from: "borrowers",
            localField: "borrower_id",
            foreignField: "borrower_id",
            as: "borrower",
          },
        },
        {
          $lookup: {
            from: "returned_books",
            localField: "borrow_id",
            foreignField: "borrow_id",
            as: "returnRecord",
          },
        },
        { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$borrower", preserveNullAndEmptyArrays: true } },
        {
          $unwind: { path: "$returnRecord", preserveNullAndEmptyArrays: true },
        },
        { $sort: { date_borrowed: -1, "returnRecord.returned_date": -1 } },
        {
          $project: {
            _id: 0,
            borrow_id: 1,
            borrower_id: 1,
            book_id: 1,
            date_borrowed: 1,
            due_date: 1,
            status: 1,
            created_at: 1,
            book_title: "$book.title",
            title: "$book.title",
            author_name: "$book.author_name",
            borrower_name: "$borrower.name",
            returned_date: "$returnRecord.returned_date",
            violation: { $ifNull: ["$returnRecord.violation", "None"] },
            penalty: { $ifNull: ["$returnRecord.penalty", 0] },
            amount_paid: { $ifNull: ["$returnRecord.amount_paid", 0] },
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllRecords,
};
