"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddOpportunityForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    providerName: "",
    categoryId: categories[0]?.id || "",
    location: "",
    fundingType: "NOT_SPECIFIED",
    applicationUrl: "",
    deadline: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/add-opportunity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to add opportunity.");
      return;
    }

    setSuccess(true);
    setForm({
      title: "",
      description: "",
      providerName: "",
      categoryId: categories[0]?.id || "",
      location: "",
      fundingType: "NOT_SPECIFIED",
      applicationUrl: "",
      deadline: "",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
      {success && (
        <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">
          Opportunity added successfully.
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Provider/Organization</label>
          <input
            type="text"
            required
            value={form.providerName}
            onChange={(e) => updateField("providerName", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Funding Type</label>
          <select
            value={form.fundingType}
            onChange={(e) => updateField("fundingType", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            <option value="NOT_SPECIFIED">Not Specified</option>
            <option value="FULLY_FUNDED">Fully Funded</option>
            <option value="PARTIALLY_FUNDED">Partially Funded</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Application URL</label>
          <input
            type="url"
            required
            value={form.applicationUrl}
            onChange={(e) => updateField("applicationUrl", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Deadline (optional)</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => updateField("deadline", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Opportunity"}
      </button>
    </form>
  );
}