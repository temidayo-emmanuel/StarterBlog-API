const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String, // Use capital "S" for String type
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: [
          "Agriculture",
          "Business",
          "Education",
          "Art",
          "Investment",
          "Uncategorized",
          "Weather",
        ],
        message: "{VALUE} is not a valid category",
      },
    },

    description: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
