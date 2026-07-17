"use client";

import React, { useState } from "react";
import EditProfileModal from "./EditProfileModal";

interface EditProfileControlProps {
  profile: {
    id: string;
    name: string | null;
    bio: string | null;
    image: string | null;
    songUrl: string | null;
  };
  token: string;
}

export default function EditProfileControl({ profile, token }: EditProfileControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-850 hover:border-gray-700 text-gray-300 font-semibold rounded-full transition-all text-xs shadow-inner"
      >
        ⚙️ Edit Profile
      </button>

      {isOpen && (
        <EditProfileModal
          profile={profile}
          token={token}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
