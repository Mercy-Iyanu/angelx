"use client"

import { useState, useRef, startTransition } from "react"
import { importStudents, type ImportRow, type ImportResult } from "@/actions/student"
import { CLASS_LEVELS } from "@/lib/student-constants"

type Step = "upload" | "preview" | "result"

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function normalizeKey(k: string) {
  return k.toLowerCase().replace(/[\s_\-]/g, "")
}

function parseCSV(text: string): ImportRow[] {
  const lines = text
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim())
  if (lines.length < 2) return []

  const rawHeaders = parseCSVLine(lines[0]).map((h) =>
    h.replace(/^"(.*)"$/, "$1")
  )
  const get = (row: Record<string, string>, ...keys: string[]) => {
    for (const k of keys) {
      const found = Object.entries(row).find(
        ([h]) => normalizeKey(h) === normalizeKey(k)
      )
      if (found?.[1]) return found[1]
    }
    return ""
  }

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line)
    const raw: Record<string, string> = Object.fromEntries(
      rawHeaders.map((h, i) => [h, values[i] ?? ""])
    )
    return {
      firstName: get(raw, "firstName", "first name", "first_name"),
      lastName: get(raw, "lastName", "last name", "last_name"),
      dateOfBirth: get(raw, "dateOfBirth", "dob", "date of birth", "date_of_birth"),
      gender: get(raw, "gender"),
      classLevel: get(raw, "classLevel", "class", "class level", "class_level"),
      admissionNumber:
        get(raw, "admissionNumber", "admissionNo", "admission number", "admission_number") || undefined,
      parentName:
        get(raw, "parentName", "parent name", "parent_name", "guardian") || undefined,
      parentPhone:
        get(raw, "parentPhone", "parent phone", "parent_phone", "guardian phone") || undefined,
      parentEmail:
        get(raw, "parentEmail", "parent email", "parent_email", "guardian email") || undefined,
      currentBalance:
        get(raw, "currentBalance", "current balance", "current_balance", "balance") || undefined,
    }
  })
}

function downloadTemplate() {
  const headers =
    "firstName,lastName,dateOfBirth,gender,classLevel,admissionNumber,parentName,parentPhone,parentEmail,currentBalance"
  const example =
    "Chidera,Okafor,2015-03-15,male,Primary 3,ADM001,Ngozi Okafor,08012345678,ngozi@example.com,0"
  const blob = new Blob([headers + "\n" + example], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "students_template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export default function ImportCSVModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState<Step>("upload")
  const [rows, setRows] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState("")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setParseError("")
    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setParseError(
          "No data rows found. Make sure the file has a header row and at least one data row."
        )
        return
      }
      setRows(parsed)
      setStep("preview")
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = () => {
    startTransition(async () => {
      setImporting(true)
      const res = await importStudents(rows)
      setResult(res)
      setImporting(false)
      setStep("result")
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Import students from CSV
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === "upload" && "Upload a CSV file to import multiple students at once"}
              {step === "preview" && `${rows.length} student${rows.length !== 1 ? "s" : ""} found — review before importing`}
              {step === "result" && "Import complete"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Upload step */}
          {step === "upload" && (
            <div className="flex flex-col gap-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              >
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  Drop your CSV file here, or{" "}
                  <span className="text-blue-600">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">.csv files only</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>

              {parseError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {parseError}
                </p>
              )}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Expected columns
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["firstName", "lastName", "dateOfBirth", "gender", "classLevel"].map(
                    (h) => (
                      <code
                        key={h}
                        className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700"
                      >
                        {h}
                      </code>
                    )
                  )}
                  {[
                    "admissionNumber",
                    "parentName",
                    "parentPhone",
                    "parentEmail",
                    "currentBalance",
                  ].map((h) => (
                    <code
                      key={h}
                      className="text-xs bg-white border border-dashed border-gray-300 rounded px-1.5 py-0.5 text-gray-400"
                    >
                      {h}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Date format: <strong>YYYY-MM-DD</strong> · Gender:{" "}
                  <strong>male</strong> or <strong>female</strong> · Class levels:{" "}
                  {CLASS_LEVELS.slice(0, 3).join(", ")}&hellip; · All new students start
                  as <strong>Active</strong> with a balance of <strong>0</strong> unless a
                  balance is given.
                </p>
              </div>

              <button
                onClick={downloadTemplate}
                className="self-start flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download template
              </button>
            </div>
          )}

          {/* Preview step */}
          {step === "preview" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Name", "Class", "Gender", "DOB", "Adm. No.", "Parent", "Balance"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{r.classLevel || <span className="text-red-400">—</span>}</td>
                      <td className="px-3 py-2 text-gray-600 capitalize">{r.gender || <span className="text-red-400">—</span>}</td>
                      <td className="px-3 py-2 text-gray-500">{r.dateOfBirth || <span className="text-red-400">—</span>}</td>
                      <td className="px-3 py-2 text-gray-500">{r.admissionNumber || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{r.parentName || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{r.currentBalance || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                  Showing 10 of {rows.length} rows
                </p>
              )}
            </div>
          )}

          {/* Result step */}
          {step === "result" && result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 shrink-0">
                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {result.imported} student{result.imported !== 1 ? "s" : ""} imported
                  </p>
                  {result.skipped > 0 && (
                    <p className="text-xs text-gray-500">
                      {result.skipped} skipped (duplicate admission number)
                    </p>
                  )}
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold text-red-700 mb-2">
                    Rows with errors (not imported)
                  </p>
                  <ul className="flex flex-col gap-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          {step === "upload" && (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}

          {step === "preview" && (
            <>
              <button
                onClick={() => {
                  setRows([])
                  setStep("upload")
                }}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {importing
                  ? "Importing…"
                  : `Import ${rows.length} student${rows.length !== 1 ? "s" : ""}`}
              </button>
            </>
          )}

          {step === "result" && (
            <button
              onClick={onSuccess}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
