import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/User";

// GET /api/users?wallet=<address> — Fetch user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const wallet = request.nextUrl.searchParams.get("wallet");

    if (wallet) {
      const user = await User.findOne({ walletAddress: wallet });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    // If no wallet param, return all users (limited for safety)
    const users = await User.find().limit(50).select("-__v");
    return NextResponse.json({ users, count: users.length });
  } catch (error: any) {
    console.error("[API /users GET]", error);
    return NextResponse.json(
      { error: "Database connection failed", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/users — Create or update user profile
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { walletAddress, username, displayName, avatarUrl, arciumPubkey } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    // Upsert — create if not exists, update if exists
    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        walletAddress,
        ...(username && { username }),
        ...(displayName && { displayName }),
        ...(avatarUrl && { avatarUrl }),
        ...(arciumPubkey && { arciumPubkey }),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ user, created: true });
  } catch (error: any) {
    console.error("[API /users POST]", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Username or wallet already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}
