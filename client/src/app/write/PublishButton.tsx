"use client";

import React from "react";
import { useFormStatus } from "react-dom";

export default function PublishButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-white text-gray-950 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></span>
          Publishing to the Verse...
        </>
      ) : (
        "Publish to the Verse"
      )}
    </button>
  );
}
