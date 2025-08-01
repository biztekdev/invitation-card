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

    // Check if user already exists
    const existingInvitation = await Invitation.findOne({ email })
    
    if (existingInvitation) {
      return NextResponse.json({ 
        message: "You are already invited!", 
        alreadyInvited: true,
        data: existingInvitation 
      }, { status: 200 })
    }

    const newInvitation = await Invitation.create({ fullName, email, phone })
    return NextResponse.json({ 
      message: "Invitation saved successfully", 
      alreadyInvited: false,
      data: newInvitation 
    }, { status: 201 })
  } catch (error) {
    console.error("Error saving invitation:", error)
    return NextResponse.json({ message: "Error saving invitation", error }, { status: 500 })
  }
}

export async function GET(req: Request) {
  await dbConnect()

  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ message: "Email parameter is required" }, { status: 400 })
    }

    const invitation = await Invitation.findOne({ email })
    
    if (invitation) {
      return NextResponse.json({ 
        message: "User found", 
        alreadyInvited: true,
        data: invitation 
      }, { status: 200 })
    } else {
      return NextResponse.json({ 
        message: "User not found", 
        alreadyInvited: false 
      }, { status: 404 })
    }
  } catch (error) {
    console.error("Error checking invitation:", error)
    return NextResponse.json({ message: "Error checking invitation", error }, { status: 500 })
  }
}
