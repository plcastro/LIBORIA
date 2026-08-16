const { collection, getNextSequence } = require("../config/database");

const toId = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};

// GET all borrowers
const getBorrowers = async (req, res) => {
  try {
    const borrowers = await collection("borrowers");
    const results = await borrowers.find({}).toArray();
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

// GET borrower by ID
const getBorrowerById = async (req, res) => {
  try {
    const borrowers = await collection("borrowers");
    const borrower = await borrowers.findOne({
      borrower_id: toId(req.params.id),
    });

    if (!borrower) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    res.json(borrower);
  } catch (err) {
    handleError(res, err);
  }
};

// CREATE borrower
const createBorrower = async (req, res) => {
  try {
    const { name, year_level, course, created_at } = req.body;

    if (!name || !year_level || !course) {
      return res
        .status(400)
        .json({ error: "Name, Year Level, and Course are all required" });
    }

    const borrowers = await collection("borrowers");
    const existingBorrower = await borrowers.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existingBorrower) {
      return res.status(400).json({ error: "Borrower already exists" });
    }

    const borrower = {
      borrower_id: await getNextSequence("borrowers"),
      name,
      year_level,
      course,
      created_at: created_at || new Date(),
    };

    await borrowers.insertOne(borrower);
    res.status(201).json(borrower);
  } catch (err) {
    handleError(res, err);
  }
};

// UPDATE borrower
const updateBorrower = async (req, res) => {
  try {
    const borrowerId = toId(req.params.id);
    const { name, year_level, course } = req.body;
    const borrowers = await collection("borrowers");

    const duplicate = await borrowers.findOne({
      borrower_id: { $ne: borrowerId },
      name,
    });

    if (duplicate) {
      return res.status(400).json({ error: "Borrower already exists" });
    }

    const result = await borrowers.findOneAndUpdate(
      { borrower_id: borrowerId },
      { $set: { name, year_level, course } },
      { returnDocument: "after" }
    );
    const updatedBorrower = result.value || result;

    if (!updatedBorrower) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    res.json(updatedBorrower);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE borrower
const deleteBorrower = async (req, res) => {
  try {
    const borrowers = await collection("borrowers");
    const result = await borrowers.deleteOne({ borrower_id: toId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    res.json({ message: "Borrower deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  getBorrowers,
  getBorrowerById,
  createBorrower,
  updateBorrower,
  deleteBorrower,
};
