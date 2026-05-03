import Task from "../models/Task.js";

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET TASKS (user sees assigned tasks)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
    }).populate("project", "name");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE STATUS
export const updateTask = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const pending = tasks.filter(t => t.status !== "completed").length;

    const overdue = tasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
    ).length;

    res.json({ total, completed, pending, overdue });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};