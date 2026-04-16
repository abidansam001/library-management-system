const Book = require("../models/Book");
const Student = require("../models/Student");
const Attendant = require("../models/Attendant");

// POST /books
const createBook = async (req, res, next) => {
  try {
    const { title, isbn, authors } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Book title is required" });
    }
    if (!authors || !Array.isArray(authors) || authors.length === 0) {
      return res.status(400).json({ success: false, message: "At least one author ID is required" });
    }
    const book = await Book.create({ title, isbn, authors });
    await book.populate("authors");
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// GET /books  (with pagination + search bonus)
const getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search by title
    const query = {};
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.status) {
      query.status = req.query.status.toUpperCase();
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate("authors")
      .populate("borrowedBy")
      .populate("issuedBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add overdue flag (bonus)
    const now = new Date();
    const booksWithOverdue = books.map((book) => {
      const b = book.toObject();
      if (b.status === "OUT" && b.returnDate && new Date(b.returnDate) < now) {
        b.isOverdue = true;
      } else {
        b.isOverdue = false;
      }
      return b;
    });

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: booksWithOverdue,
    });
  } catch (error) {
    next(error);
  }
};

// GET /books/:id
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authors")
      .populate("borrowedBy")
      .populate("issuedBy");

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const bookObj = book.toObject();

    // Add overdue flag
    if (bookObj.status === "OUT" && bookObj.returnDate && new Date(bookObj.returnDate) < new Date()) {
      bookObj.isOverdue = true;
    } else {
      bookObj.isOverdue = false;
    }

    res.status(200).json({ success: true, data: bookObj });
  } catch (error) {
    next(error);
  }
};

// PUT /books/:id
const updateBook = async (req, res, next) => {
  try {
    // Prevent manually changing borrow fields via update
    const { borrowedBy, issuedBy, returnDate, status, ...rest } = req.body;

    const book = await Book.findByIdAndUpdate(req.params.id, rest, {
      new: true,
      runValidators: true,
    }).populate("authors");

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// DELETE /books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /books/:id/borrow
const borrowBook = async (req, res, next) => {
  try {
    const { studentId, attendantId, returnDate } = req.body;

    if (!studentId || !attendantId || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "studentId, attendantId, and returnDate are required",
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (book.status === "OUT") {
      return res.status(400).json({ success: false, message: "Book is already borrowed" });
    }

    // Validate student and attendant exist
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const attendant = await Attendant.findById(attendantId);
    if (!attendant) {
      return res.status(404).json({ success: false, message: "Attendant not found" });
    }

    book.status = "OUT";
    book.borrowedBy = studentId;
    book.issuedBy = attendantId;
    book.returnDate = new Date(returnDate);
    await book.save();

    await book.populate(["authors", "borrowedBy", "issuedBy"]);

    res.status(200).json({ success: true, message: "Book borrowed successfully", data: book });
  } catch (error) {
    next(error);
  }
};

// POST /books/:id/return
const returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (book.status === "IN") {
      return res.status(400).json({ success: false, message: "Book is not currently borrowed" });
    }

    book.status = "IN";
    book.borrowedBy = null;
    book.issuedBy = null;
    book.returnDate = null;
    await book.save();

    await book.populate("authors");

    res.status(200).json({ success: true, message: "Book returned successfully", data: book });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
};