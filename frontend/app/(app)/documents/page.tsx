"use client";
import React, { useState, useRef } from "react";
import { useAppState } from "@/lib/hooks";
import { Card, PageHeader, LoadingSpinner, ErrorBanner } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Document } from "@/lib/types";

const REVIEWER_ROLES = ["Compliance / Legal Reviewer", "TCC Platform Admin", "Organisation Admin"];

export default function DocumentsPage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [reviewActionFeedback, setReviewActionFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const userRole = (session?.user as any)?.role || "";
  const canReview = REVIEWER_ROLES.includes(userRole);

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

  const handleDocumentReview = async (
    docId: number,
    newStatus: string,
    triggerReanalysis = false
  ) => {
    setReviewActionLoading(true);
    setReviewActionFeedback("");
    try {
      const res = await api.reviewDocument(
        docId,
        {
          status: newStatus,
          trigger_reanalysis: triggerReanalysis,
          review_notes: triggerReanalysis
            ? "Re-ran DPDP requirement matching against extracted passages."
            : `Reviewer designated document status as ${newStatus}.`,
        },
        session?.user?.email,
        userRole
      );
      setReviewActionFeedback(
        `✓ ${res.message}${
          res.reanalysis_findings_created > 0
            ? ` (${res.reanalysis_findings_created} new finding(s) generated)`
            : ""
        }`
      );
      await refresh();
      // Keep selected doc updated
      if (selectedDoc && selectedDoc.id === docId) {
        setSelectedDoc((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update document status");
    } finally {
      setReviewActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Intelligence & Evidence Repository"
        subtitle="Upload policies, agreements, and SOPs for clause extraction, human review, and DPDP gap mapping"
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
            const statusStyles: Record<string, string> = {
              Reviewed: "bg-emerald-50 text-emerald-700 border-emerald-200",
              "Needs Clarification": "bg-amber-50 text-amber-700 border-amber-200",
              Analysed: "bg-blue-50 text-blue-700 border-blue-200",
            };
            const currentBadge =
              statusStyles[doc.status] || "bg-slate-100 text-slate-600 border-slate-200";

            return (
              <Card
                key={doc.id}
                className={`p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20"
                    : "hover:border-slate-300"
                }`}
              >
                <div
                  className="flex items-start justify-between gap-4"
                  onClick={() => {
                    setSelectedDoc(isSelected ? null : doc);
                    setReviewActionFeedback("");
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {doc.doc_type}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${currentBadge}`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Filename: <code className="text-slate-700">{doc.filename}</code> · Indexed on{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {isSelected ? "Close Review" : "Inspect & Review →"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Clause Inspection & Review Drawer */}
        <div>
          <Card className="p-5 sticky top-24 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Document Review & Passages
            </h3>

            {selectedDoc ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedDoc.title}</h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedDoc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedDoc.filename}</p>
                </div>

                {/* Reviewer Action Controls */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Reviewer Verification Workflow
                  </span>

                  {canReview ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          disabled={reviewActionLoading || selectedDoc.status === "Reviewed"}
                          onClick={() => handleDocumentReview(selectedDoc.id, "Reviewed")}
                          className="px-2.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                        >
                          ✓ Mark Reviewed
                        </button>

                        <button
                          type="button"
                          disabled={reviewActionLoading || selectedDoc.status === "Needs Clarification"}
                          onClick={() =>
                            handleDocumentReview(selectedDoc.id, "Needs Clarification")
                          }
                          className="px-2.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                        >
                          ? Needs Clarification
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={reviewActionLoading}
                        onClick={() =>
                          handleDocumentReview(selectedDoc.id, selectedDoc.status, true)
                        }
                        className="w-full text-center px-2.5 py-1.5 text-xs border border-blue-300 bg-blue-50/60 hover:bg-blue-100/60 text-blue-700 font-medium rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        ⚡ Re-run DPDP Analysis
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Review actions restricted to Reviewer or Admin role.
                    </p>
                  )}

                  {reviewActionFeedback && (
                    <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {reviewActionFeedback}
                    </div>
                  )}
                </div>

                {/* Extracted Clause Passages */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Extracted Key Clauses ({selectedDoc.key_passages?.length || 0})
                  </span>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
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
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select an analyzed document from the left to inspect extracted clauses, page references, and execute human reviewer controls.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
