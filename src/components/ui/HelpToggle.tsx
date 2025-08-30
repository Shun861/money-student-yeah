"use client";
import { useState } from "react";

interface HelpToggleProps {
  label: string;
  children: React.ReactNode;
  helpContent: {
    title: string;
    description: string;
  };
  required?: boolean;
}

export function HelpToggle({ label, children, helpContent, required = false }: HelpToggleProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showHelp ? '解説を隠す' : '解説を見る'}
        </button>
      </div>
      {children}
      {showHelp && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p><strong>{helpContent.title}</strong></p>
          <p>{helpContent.description}</p>
        </div>
      )}
    </div>
  );
}
