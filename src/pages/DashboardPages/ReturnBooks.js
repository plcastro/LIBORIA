import React, { useState } from "react";
import { Table, Tag, Input } from "antd";
import ReturnBookModal from "../../components/Modal/ReturnBookModal";
const REASONS = [
  { label: "Late Return", value: "Late Return" },
  { label: "Damaged", value: "Damaged" },
  { label: "Lost", value: "Lost" },
];
const ReturnBooks = ({ REASONS }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const sampleData = [
    {
      key: "1",
      id: "1",
      name: "John Brown",
      yrlvl: "2nd Year",
      course: ["BSIT-MWA"],
      book_title: "Minecraft for Dummies",
      date_borrowed: "Oct 2, 2025",
      due_date: "Oct 7, 2025",
    },
    {
      key: "2",
      id: "2",
      name: "Jane Smith",
      yrlvl: "1st Year",
      course: ["BSIT-MAA"],
      book_title: "Learn Python the Hard Way",
      date_borrowed: "Oct 3, 2025",
      due_date: "Oct 8, 2025",
    },
    {
      key: "3",
      id: "3",
      name: "Michael Johnson",
      yrlvl: "3rd Year",
      course: ["BSCS"],
      book_title: "JavaScript: The Good Parts",
      date_borrowed: "Oct 4, 2025",
      due_date: "Oct 9, 2025",
    },
    {
      key: "4",
      id: "4",
      name: "Emily Davis",
      yrlvl: "4th Year",
      course: ["BSIT-MWA"],
      book_title: "HTML & CSS Design and Build Websites",
      date_borrowed: "Oct 5, 2025",
      due_date: "Oct 10, 2025",
    },
    {
      key: "5",
      id: "5",
      name: "Robert Wilson",
      yrlvl: "2nd Year",
      course: ["BSIT-MAA"],
      book_title: "C Programming Absolute Beginner’s Guide",
      date_borrowed: "Oct 6, 2025",
      due_date: "Oct 11, 2025",
    },
    {
      key: "6",
      id: "6",
      name: "Sophia Martinez",
      yrlvl: "1st Year",
      course: ["BSCS"],
      book_title: "Head First Java",
      date_borrowed: "Oct 7, 2025",
      due_date: "Oct 12, 2025",
    },
    {
      key: "7",
      id: "7",
      name: "Daniel Anderson",
      yrlvl: "3rd Year",
      course: ["BSIT-MWA"],
      book_title: "Clean Code",
      date_borrowed: "Oct 8, 2025",
      due_date: "Oct 13, 2025",
    },
    {
      key: "8",
      id: "8",
      name: "Olivia Thomas",
      yrlvl: "4th Year",
      course: ["BSIT-MAA"],
      book_title: "Python Crash Course",
      date_borrowed: "Oct 9, 2025",
      due_date: "Oct 14, 2025",
    },
    {
      key: "9",
      id: "9",
      name: "William Taylor",
      yrlvl: "2nd Year",
      course: ["BSCS"],
      book_title: "The Pragmatic Programmer",
      date_borrowed: "Oct 10, 2025",
      due_date: "Oct 15, 2025",
    },
    {
      key: "10",
      id: "10",
      name: "Ava Moore",
      yrlvl: "1st Year",
      course: ["BSIT-MWA"],
      book_title: "You Don’t Know JS Yet",
      date_borrowed: "Oct 11, 2025",
      due_date: "Oct 16, 2025",
    },
    {
      key: "11",
      id: "11",
      name: "James Jackson",
      yrlvl: "3rd Year",
      course: ["BSIT-MAA"],
      book_title: "Eloquent JavaScript",
      date_borrowed: "Oct 12, 2025",
      due_date: "Oct 17, 2025",
    },
    {
      key: "12",
      id: "12",
      name: "Charlotte White",
      yrlvl: "4th Year",
      course: ["BSCS"],
      book_title: "Effective Java",
      date_borrowed: "Oct 13, 2025",
      due_date: "Oct 18, 2025",
    },
    {
      key: "13",
      id: "13",
      name: "Benjamin Harris",
      yrlvl: "2nd Year",
      course: ["BSIT-MWA"],
      book_title: "React Up and Running",
      date_borrowed: "Oct 14, 2025",
      due_date: "Oct 19, 2025",
    },
    {
      key: "14",
      id: "14",
      name: "Mia Clark",
      yrlvl: "1st Year",
      course: ["BSIT-MAA"],
      book_title: "SQL for Beginners",
      date_borrowed: "Oct 15, 2025",
      due_date: "Oct 20, 2025",
    },
    {
      key: "15",
      id: "15",
      name: "Elijah Lewis",
      yrlvl: "3rd Year",
      course: ["BSCS"],
      book_title: "Algorithms Unlocked",
      date_borrowed: "Oct 16, 2025",
      due_date: "Oct 21, 2025",
    },
    {
      key: "16",
      id: "16",
      name: "Amelia Walker",
      yrlvl: "4th Year",
      course: ["BSIT-MWA"],
      book_title: "Cracking the Coding Interview",
      date_borrowed: "Oct 17, 2025",
      due_date: "Oct 22, 2025",
    },
    {
      key: "17",
      id: "17",
      name: "Lucas Hall",
      yrlvl: "2nd Year",
      course: ["BSIT-MAA"],
      book_title: "Learn JavaScript Visually",
      date_borrowed: "Oct 18, 2025",
      due_date: "Oct 23, 2025",
    },
    {
      key: "18",
      id: "18",
      name: "Harper Allen",
      yrlvl: "1st Year",
      course: ["BSCS"],
      book_title: "Web Design with HTML, CSS, JavaScript",
      date_borrowed: "Oct 19, 2025",
      due_date: "Oct 24, 2025",
    },
    {
      key: "19",
      id: "19",
      name: "Henry Young",
      yrlvl: "3rd Year",
      course: ["BSIT-MWA"],
      book_title: "Learning React",
      date_borrowed: "Oct 20, 2025",
      due_date: "Oct 25, 2025",
    },
    {
      key: "20",
      id: "20",
      name: "Evelyn King",
      yrlvl: "4th Year",
      course: ["BSIT-MAA"],
      book_title: "Introduction to Algorithms",
      date_borrowed: "Oct 21, 2025",
      due_date: "Oct 26, 2025",
    },
  ];

  const handleReturn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmit = (values) => {
    console.log("Return submitted:", values);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Year Level",
      dataIndex: "yrlvl",
      key: "yrlvl",
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (course) =>
        course.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "BSIT-MWA") color = "volcano";
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        }),
    },
    {
      title: "Book Title",
      dataIndex: "book_title",
      key: "book_title",
    },
    {
      title: "Date Borrowed",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <a onClick={() => handleReturn(record)} style={{ color: "red" }}>
          Return
        </a>
      ),
    },
  ];

  return (
    <>
      <Input
        type="search"
        placeholder="Search data"
        // onChange={handleSearch}
        style={{ width: "200px", height: "40px", marginBottom: "20px" }}
      />
      <Table
        columns={columns}
        dataSource={sampleData}
        rowKey="id"
        pagination={false}
        scroll={{ y: sampleData.length > 10 ? 650 : undefined }}
      />

      <ReturnBookModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initialValues={selectedRecord}
        REASONS={REASONS}
      />
    </>
  );
};

export default ReturnBooks;
