"use client";

import { authClient } from "@/lib/auth-client";

const Navbar = () => {
  const { signOut, useSession } = authClient;
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="font-bold text-xl">ZexaNext</div>

      <div>
        {!session ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Login
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            onClick={() => signOut()}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
