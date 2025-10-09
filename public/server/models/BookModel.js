class BookModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.yrlvl = data.yrlvl;
    this.course = data.course;
    this.book_title = data.book_title;
    this.date_borrowed = data.date_borrowed;
    this.due_date = data.due_date;
    // Optionally include static methods for data validation or manipulation
  }

  // Example of Model logic: a static method to fetch all current borrowed books
  static async findAllBorrowed() {
    // 💡 In a real app, this would be a database query (e.g., SELECT * FROM borrowed_books)
    // For now, return your mock data:
    return [
      {
        key: "1",
        id: "1",
        name: "John Brown",
        yrlvl: "2nd Year",
        course: ["BSIT-MWA"],
        book_title: "Minecraft for dummies",
        date_borrowed: "Oct 2, 2025",
        due_date: "Oct 13, 2025",
      },
    ];
  }
}

export default BookModel;
