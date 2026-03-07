import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: false
    },

    password: {
      type: String,
      required: false
    },

    isAdmin: {
      type: Boolean,
      default: false
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    pendingEmail: {
      type: String
    },

    profileImage: {
      type: String,
      default: ""
    },

    refreshToken: {
      type: String,
      default: ""
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    // ⭐ WALLET BALANCE
    wallet: {
      type: Number,
      default: 0
    },

    // ⭐ WALLET TRANSACTION HISTORY
    walletHistory: [
      {
        type: {
          type: String,
          enum: ["CREDIT", "DEBIT"]
        },
        amount: Number,
        reason: String,
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]

  },
  {
    timestamps: true
  }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


export default mongoose.model("User", userSchema);