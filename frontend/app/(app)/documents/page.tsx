"use client";
import React, { useState, useRef } from "react";
import { useAppState } from "@/lib/hooks";
import { Card, PageHeader, LoadingSpinner, ErrorBanner } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Document } from "@/lib/types";

export default function DocumentsPage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.uploadDocument(formData, session?.user?.email);
      setUploadSuccess(
        `Successfully extracted and indexed "${file.name}". Created ${res.findings_created} AI-suggested finding(s) grounded in DPDP requirements.`
      );
      await refresh();
    } catch (err: any) {
      setUploadError(err.message || "Document extraction failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Intelligence & Evidence Repository"
        subtitle="Upload policies, agreements, and SOPs for clause extraction and DPDP gap mapping"
        actions={
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {uploading ? "Extracting Clauses..." : "+ Upload PDF / DOCX"}
            </button>
          </div>
        }
      />

      {/* Upload Feedback */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
          <span className="font-semibold text-red-800">Extraction Error:</span>
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
          <span className="font-semibold text-emerald-900">Success:</span>
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 rounded-2xl p-8 text-center transition-all cursor-pointer"
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
          ↑
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Upload compliance documents (.PDF or .DOCX)
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports HR Policies, Website Privacy Notices, Vendor MSAs, and Information Security SOPs
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Validated extraction with page / clause citations · Max 20MB
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Analyzed Evidence Documents ({state?.documents.length || 0})
          </h3>

          {state?.documents.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <Card
                key={doc.id}
                className={`p-4 transition-all cursor-pointer ${
                  isSelected ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20" : "hover:border-slate-300"
                }`}
              >
                <div
                  className="flex items-start justify-between gap-4"
                  onClick={() => setSelectedDoc(isSelected ? null : doc)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {doc.doc_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Filename: <code className="text-slate-700">{doc.filename}</code> · Indexed on{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                    {isSelected ? "Close Clauses" : "View Clauses →"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Clause Inspection Drawer */}
        <div>
          <Card className="p-5 sticky top-24">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Clause Inspection & Passages
            </h3>

            {selectedDoc ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedDoc.title}</h4>
                  <p className="text-xs text-slate-500">{selectedDoc.filename}</p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedDoc.key_passages && selectedDoc.key_passages.length > 0 ? (
                    selectedDoc.key_passages.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                          <span>{p.page}</span>
                          <span>{p.section}</span>
                        </div>
                        <p className="text-slate-700 italic leading-relaxed">"{p.text}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No key passages extracted.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select an analyzed document from the left to inspect extracted clauses and page references.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
