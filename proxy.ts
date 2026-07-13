// proxy.ts (یا در مسیر src/proxy.ts)
import { NextRequest, NextResponse } from "next/server";

const APP_KEY = "pdf-editor-secret-key-123456";

export function proxy(request: NextRequest) {
  const receivedAppKey = request.headers.get("x-app-key");

  if (receivedAppKey !== APP_KEY) {
    return new NextResponse(
      "Forbidden: Access allowed only through the desktop application.",
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
