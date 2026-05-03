import Project from "../models/Project.js";

// CREATE PROJECT (Admin only)
export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description,
      members,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PROJECTS (user sees their projects)
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id },
      ],
    }).populate("members", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};