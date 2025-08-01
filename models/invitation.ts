import mongoose, { Schema, type Document } from "mongoose"

export interface IInvitation extends Document {
  fullName: string
  email: string
  phone: string
  createdAt: Date
}

const InvitationSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>("Invitation", InvitationSchema)

export default Invitation
