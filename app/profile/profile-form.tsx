"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle = {
  background: "var(--surface-alt)",
  borderColor: "var(--border)",
  color: "var(--foreground)",
};

export default function ProfileForm({ profile }: { profile: any }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    displayName: profile?.displayName || "",
    country: profile?.country || "",
    degreeLevel: profile?.degreeLevel || "",
    degreeProgram: profile?.degreeProgram || "",
    university: profile?.university || "",
    academicYear: profile?.academicYear || "",
    graduationYear: profile?.graduationYear?.toString() || "",
    skills: profile?.skills?.join(", ") || "",
    researchInterests: profile?.researchInterests?.join(", ") || "",
    fundingPreference: profile?.fundingPreference || "",
    remotePreference: profile?.remotePreference || "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to save profile. Please try again.");
      setSaved(false);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  const labelClass = "mb-1 block text-sm font-medium";
  const labelStyle = { color: "var(--muted)" };
  const inputClass = "w-full rounded-lg border px-3 py-2 text-sm outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {saved && (
        <p className="rounded-md p-2 text-sm" style={{ background: "var(--teal-light)", color: "var(--teal)" }}>
          Profile saved successfully.
        </p>
      )}

      {error && (
        <p className="rounded-md p-2 text-sm" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>
          {error}
        </p>
      )}

      <div>
        <label className={labelClass} style={labelStyle}>Display Name</label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => updateField("displayName", e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Country</label>
        <input
          type="text"
          value={form.country}
          onChange={(e) => updateField("country", e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Degree Level</label>
        <select
          value={form.degreeLevel}
          onChange={(e) => updateField("degreeLevel", e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">Select...</option>
          <option value="HIGH_SCHOOL">High School</option>
          <option value="UNDERGRADUATE">Undergraduate</option>
          <option value="MASTERS">Masters</option>
          <option value="PHD">PhD</option>
          <option value="POSTDOC">Postdoc</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Degree Program / Major</label>
        <input
          type="text"
          value={form.degreeProgram}
          onChange={(e) => updateField("degreeProgram", e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>University</label>
        <input
          type="text"
          value={form.university}
          onChange={(e) => updateField("university", e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>Academic Year</label>
          <input
            type="text"
            placeholder="e.g. 3rd year"
            value={form.academicYear}
            onChange={(e) => updateField("academicYear", e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Graduation Year</label>
          <input
            type="number"
            value={form.graduationYear}
            onChange={(e) => updateField("graduationYear", e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Skills (comma separated)</label>
        <input
          type="text"
          placeholder="e.g. React, Python, Data Analysis"
          value={form.skills}
          onChange={(e) => updateField("skills", e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Research Interests (comma separated)</label>
        <input
          type="text"
          placeholder="e.g. Machine Learning, Robotics"
          value={form.researchInterests}
          onChange={(e) => updateField("researchInterests", e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Funding Preference</label>
        <select
          value={form.fundingPreference}
          onChange={(e) => updateField("fundingPreference", e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">No preference</option>
          <option value="FULLY_FUNDED">Fully Funded</option>
          <option value="PARTIALLY_FUNDED">Partially Funded</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Remote Preference</label>
        <select
          value={form.remotePreference}
          onChange={(e) => updateField("remotePreference", e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">No preference</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ON_SITE">On-site</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        style={{ background: "var(--primary)" }}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}