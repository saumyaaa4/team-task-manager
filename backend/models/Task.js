import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    dueDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);