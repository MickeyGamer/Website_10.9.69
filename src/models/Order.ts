import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrder extends Document {
  user: Types.ObjectId;

  items: {
    product: Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  totalAmount: number;

  status:
    | "PENDING"
    | "PAID"
    | "SHIPPED"
    | "COMPLETED"
    | "CANCELLED";

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
        },

        price: {
          type: Number,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "SHIPPED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },

  {
    timestamps: true,
  }
);

export const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);