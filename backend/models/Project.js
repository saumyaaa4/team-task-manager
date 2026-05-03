import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,

    // Admin who created project
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Team members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);