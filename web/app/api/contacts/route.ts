import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Contact } from "@/lib/db/models/Contact";
import { User } from "@/lib/db/models/User";

// GET /api/contacts?wallet=<ownerWallet> — Fetch contacts for a wallet
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const wallet = request.nextUrl.searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet query parameter is required" },
        { status: 400 }
      );
    }

    const contacts = await Contact.find({ ownerWallet: wallet }).sort({ createdAt: -1 });

    // Enrich with user profile data
    const enriched = await Promise.all(
      contacts.map(async (c) => {
        const user = await User.findOne({ walletAddress: c.contactWallet }).select(
          "username displayName avatarUrl"
        );
        return {
          id: c._id,
          contactWallet: c.contactWallet,
          nickname: c.nickname,
          username: user?.username,
          displayName: user?.displayName,
          avatarUrl: user?.avatarUrl,
          createdAt: c.createdAt,
        };
      })
    );

    return NextResponse.json({ contacts: enriched, count: enriched.length });
  } catch (error: any) {
    console.error("[API /contacts GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/contacts — Add a contact
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { ownerWallet, contactWallet, nickname } = body;

    if (!ownerWallet || !contactWallet) {
      return NextResponse.json(
        { error: "ownerWallet and contactWallet are required" },
        { status: 400 }
      );
    }

    if (ownerWallet === contactWallet) {
      return NextResponse.json(
        { error: "Cannot add yourself as a contact" },
        { status: 400 }
      );
    }

    const contact = await Contact.findOneAndUpdate(
      { ownerWallet, contactWallet },
      { ownerWallet, contactWallet, ...(nickname && { nickname }) },
      { upsert: true, new: true }
    );

    return NextResponse.json({ contact, created: true });
  } catch (error: any) {
    console.error("[API /contacts POST]", error);
    return NextResponse.json(
      { error: "Failed to add contact", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts — Remove a contact
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { ownerWallet, contactWallet } = body;

    if (!ownerWallet || !contactWallet) {
      return NextResponse.json(
        { error: "ownerWallet and contactWallet are required" },
        { status: 400 }
      );
    }

    const result = await Contact.deleteOne({ ownerWallet, contactWallet });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    console.error("[API /contacts DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete contact", details: error.message },
      { status: 500 }
    );
  }
}
