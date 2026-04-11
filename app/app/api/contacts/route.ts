import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ message: "Mock contacts GET" });
}

export async function POST(request: Request) {
  return NextResponse.json({ message: "Mock contacts POST" });
}
