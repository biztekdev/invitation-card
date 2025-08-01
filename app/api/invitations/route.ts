import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Invitation from "@/models/invitation"

export async function POST(req: Request) {
  await dbConnect()

  try {
    const { fullName, email, phone } = await req.json()

    if (!fullName || !email || !phone) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const newInvitation = await Invitation.create({ fullName, email, phone })
    return NextResponse.json({ message: "Invitation saved successfully", data: newInvitation }, { status: 201 })
  } catch (error) {
    console.error("Error saving invitation:", error)
    return NextResponse.json({ message: "Error saving invitation", error }, { status: 500 })
  }
}
