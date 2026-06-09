import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50/60 to-white px-4 py-12">
      {/* Brand header */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-200">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-gray-900">ClinicOS <span className="text-blue-600">AI</span></span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
            <Icon className="w-7 h-7 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-gray-500 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
