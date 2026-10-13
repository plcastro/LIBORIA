const { collection } = require("../config/database");

const activeStatus = { $regex: /^(borrowed|overdue)$/i };
const getMaxBorrowedBooks = () => {
  const value = Number(process.env.MAX_BORROWED_BOOKS);
  return Number.isSafeInteger(value) && value > 0 ? value : 3;
};
const getBorrowUsage = async (userId, borrowerId, session) => {
  const options = session ? { session } : {};
  const active = borrowerId === undefined ? 0 : await collection("borrowed_books").countDocuments(
    { borrower_id: borrowerId, status: activeStatus }, options,
  );
  const pending = await collection("borrow_requests").countDocuments(
    { user_id: String(userId), status: "Pending" }, options,
  );
  return { limit: getMaxBorrowedBooks(), active, pending, used: active + pending };
};
const limitMessage = (limit) => `Borrow limit reached. You can hold up to ${limit} books, including pending requests.`;
module.exports = { activeStatus, getMaxBorrowedBooks, getBorrowUsage, limitMessage };
