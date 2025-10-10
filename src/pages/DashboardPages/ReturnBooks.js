import React, { useState } from "react";
import { Table, Tag, Input } from "antd";
import ReturnBookModal from "../../components/Modal/ReturnBookModal";

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
      book_title: "Minecraft for dummies",
      date_borrowed: "Oct 2, 2025",
      due_date: "Oct 7, 2025",
    },
    {
      key: "2",
      id: "2",
      name: "John Brown2",
      yrlvl: "2nd Year",
      course: ["BSIT-MWA"],
      book_title: "Minecraft for dummies",
      date_borrowed: "Oct 2, 2025",
      due_date: "Oct 7, 2025",
    },
    {
      key: "3",
      id: "3",
      name: "John Brown3",
      yrlvl: "2nd Year",
      course: ["BSIT-MWA"],
      book_title: "Minecraft for dummies",
      date_borrowed: "Oct 2, 2025",
      due_date: "Oct 7, 2025",
    },
    {
      key: "4",
      id: "4",
      name: "John Brown4",
      yrlvl: "2nd Year",
      course: ["BSIT-MWA"],
      book_title: "Minecraft for dummies",
      date_borrowed: "Oct 2, 2025",
      due_date: "Oct 7, 2025",
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
        scroll={{ y: sampleData.length > 10 ? 200 : undefined }}
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
