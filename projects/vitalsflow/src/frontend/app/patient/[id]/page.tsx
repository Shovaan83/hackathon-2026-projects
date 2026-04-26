"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, ChevronRight, User, Clock } from "lucide-react";

import { ActionCenter } from "@/components/ActionCenter";
import { ClinicalShell } from "@/components/ClinicalShell";
import { EvidenceInspector } from "@/components/EvidenceInspector";
import { RiskBadge } from "@/components/RiskBadge";
import { TriageScoreCard } from "@/components/TriageScoreCard";
import { VitalsForm } from "@/components/VitalsForm";
import { VitalsTrend } from "@/components/VitalsTrend";
import {
  DEFAULT_VITALS,
  getPatientSummary,
  runTriage,
  type PatientSummary,
  type TriageResult,
  type VitalsPayload,
} from "@/lib/api";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [vitals, setVitals] = useState<VitalsPayload>(DEFAULT_VITALS);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isTriaging, setIsTriaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setIsLoadingSummary(true);
      setError(null);

      try {
        const data = await getPatientSummary(patientId);
        if (active) setSummary(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load patient summary");
          setSummary({
            patient_id: patientId,
            name: `Patient ${patientId}`,
            dob: "Unknown",
            gender: "Unknown",
            clinical_summary: "Unable to retrieve FHIR summary. AI triage still available.",
          });
        }
      } finally {
        if (active) setIsLoadingSummary(false);
      }
    }

    loadSummary();
    return () => { active = false; };
  }, [patientId]);

  async function handleRunTriage() {
    setIsTriaging(true);
    setError(null);
    try {
      const result = await runTriage(patientId, vitals);
      setTriageResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Triage failed");
    } finally {
      setIsTriaging(false);
    }
  }

  const titleName = useMemo(() => summary?.name ?? `Patient ${patientId}`, [summary?.name, patientId]);

  return (
    <ClinicalShell
      title="Patient Triage Detail"
      subtitle="Evidence-backed risk scoring and clinical decision support"
      actions={
        <Link
          href="/"
          className="btn-primary"
          style={{ background: "white", color: "var(--text-secondary)", border: "1px solid var(--border-default)", boxShadow: "none" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      }
    >
      {/* Breadcrumb (SKILL.md: navigation-context) */}
      <nav className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-[var(--accent-blue)]" style={{ color: "var(--text-muted)" }}>
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" style={{ color: "var(--border-strong)" }} />
        <span style={{ color: "var(--text-tertiary)" }}>Triage Details</span>
      </nav>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--color-critical-border)] bg-[var(--color-critical-bg)] px-4 py-3 text-sm" style={{ color: "var(--color-critical-text)" }} role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Header Card */}
      <section className="panel-card p-6 stagger-card">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--accent-blue-dim)", border: "2px solid var(--accent-blue)" }}>
              <User className="h-7 w-7" style={{ color: "var(--accent-blue)" }} />
            </div>
            <div>
              <p className="section-kicker">Clinician Review Required</p>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>
                {titleName}
              </h2>
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
                MRN: <span className="tabular-nums">{patientId}</span> • {summary?.gender} • DOB: <span className="tabular-nums">{summary?.dob}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {triageResult ? (
              <RiskBadge
                tier={triageResult.triage_tier}
                score={triageResult.risk_score}
                news2Score={triageResult.news2_score}
                size="lg"
              />
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)]">
                <Clock className="h-4 w-4" />
                Awaiting Analysis
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Clinical Context (FHIR)
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {isLoadingSummary ? (
              <span className="flex items-center gap-2 italic">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Synchronizing with FHIR server...
              </span>
            ) : summary?.clinical_summary}
          </p>
        </div>
      </section>

      {/* Vitals Form Section */}
      <section className="mt-10 stagger-card" style={{ animationDelay: "100ms" }}>
        <VitalsForm
          vitals={vitals}
          onChange={setVitals}
          onSubmit={handleRunTriage}
          isLoading={isTriaging}
          patientName={titleName}
        />
      </section>

      {/* Loading Overlay for Triage */}
      {isTriaging && (
        <div className="mt-10 flex items-center justify-center gap-3 rounded-xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue-dim)]/50 p-8 stagger-card" role="status" aria-live="polite">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-blue)" }} />
          <div className="text-center">
            <p className="font-bold text-[var(--accent-blue)]" style={{ fontFamily: "var(--font-outfit)" }}>AI Analysis in Progress</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Calculating NEWS2 score and generating clinical rationale...</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {triageResult && !isTriaging && (
        <div className="space-y-8 mt-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 stagger-card" style={{ animationDelay: "200ms" }}>
            <div className="lg:col-span-1 h-full">
              <TriageScoreCard result={triageResult} />
            </div>
            <div className="lg:col-span-3 h-full">
              <ActionCenter
                patientId={patientId}
                actions={triageResult.suggested_actions}
                justification={triageResult.justification}
                news2Score={triageResult.news2_score}
                riskScore={triageResult.risk_score}
                tier={triageResult.triage_tier}
                onError={setError}
              />
            </div>
          </div>

          <section className="stagger-card mt-10" style={{ animationDelay: "300ms" }}>
            <EvidenceInspector result={triageResult} vitals={vitals} />
          </section>

          <section className="stagger-card mt-10" style={{ animationDelay: "400ms" }}>
            <VitalsTrend
              currentHR={vitals.heart_rate}
              currentSpO2={vitals.spo2}
              currentRR={vitals.respiratory_rate}
              currentTemp={vitals.temperature}
            />
          </section>
        </div>
      )}
    </ClinicalShell>
  );
}
