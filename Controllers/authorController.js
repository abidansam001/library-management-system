const Author = require("../models/Author");

// POST /authors
const createAuthor = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Author name is required" });
    }
    const author = await Author.create({ name, bio });
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

// GET /authors
const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: authors.length, data: authors });
  } catch (error) {
    next(error);
  }
};

// GET /authors/:id
const getAuthorById = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

// PUT /authors/:id
const updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

// DELETE /authors/:id
const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.status(200).json({ success: true, message: "Author deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAuthor, getAllAuthors, getAuthorById, updateAuthor, deleteAuthor };