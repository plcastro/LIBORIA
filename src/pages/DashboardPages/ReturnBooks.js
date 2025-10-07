import React, { useState } from "react";
import {
  Button,
  Row,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";

const reasonOptions = [
  { value: "Late Return", label: "Late Return" },
  { value: "Damaged", label: "Damaged" },
  { value: "Lost Book", label: "Lost Book" },
];
const handleChange = (value) => {
  console.log(`selected ${value}`);
};
const ReturnBooks = () => {
  const [componentSize, setComponentSize] = useState("default");
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };
  return (
    <Form
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 15 }}
      layout="horizontal"
      initialValues={{ size: componentSize }}
      onValuesChange={onFormLayoutChange}
      size={componentSize}
      style={{
        maxWidth: 800,
        width: "100%",
        backgroundColor: "white",
        boxShadow: " 0 5px 15px rgba(0, 0, 0, 0.1)",
        borderRadius: 20,
        padding: "20px",
        textAlign: "left",
      }}
    >
      <Row className="return-book-form">
        <Col>
          <Form.Item label="Name">
            <Input />
          </Form.Item>
          <Form.Item label="Book Title">
            <Input />
          </Form.Item>
          <Form.Item label="Returned Date">
            <DatePicker />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label="Penalty (PHP)" name="penalty">
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>
          <Form.Item label="Amount Paid" name="inCash">
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₱\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>
          <Form.Item label="Violation">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Select Reason"
              onChange={handleChange}
              options={reasonOptions}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row justify={"space-evenly"}>
        <Button
          style={{
            backgroundColor: "#000",
            color: "white",
            gap: "8px",
            height: 50,
          }}
        >
          Return
        </Button>
        <Button
          style={{
            height: 50,
          }}
        >
          Cancel
        </Button>
      </Row>
    </Form>
  );
};

export default ReturnBooks;
