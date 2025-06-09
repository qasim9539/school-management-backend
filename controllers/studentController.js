const Student = require("../models/Student");
const fs = require("fs");
const path = require("path");

// Create Student
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    
    // Handle file upload
    if (req.file) {
      studentData.photo = req.file.filename;
    }
    
    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    // Delete uploaded file if student creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(400).json({ message: "Failed to add student", error: error.message });
  }
};

// Get All Students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};

// Get Single Student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student", error: error.message });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const studentData = req.body;
    const studentId = req.params.id;
    
    // Get existing student to check for old photo
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Handle file upload
    if (req.file) {
      studentData.photo = req.file.filename;
      
      // Delete old photo if it exists
      if (existingStudent.photo) {
        const oldFilePath = path.join(__dirname, '../uploads', existingStudent.photo);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }
    
    const updated = await Student.findByIdAndUpdate(studentId, studentData, { new: true });
    res.json({ message: "Student updated", student: updated });
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(400).json({ message: "Failed to update student", error: error.message });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Delete associated photo file
    if (student.photo) {
      const filePath = path.join(__dirname, '../uploads', student.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student", error: error.message });
  }
};