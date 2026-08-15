import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { FileUp, LockKeyhole, UploadCloud } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewAssessment() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [disclosureStatus, setDisclosureStatus] = useState<"private" | "internal_review" | "public_disclosure" | "published">("private");
  const [conceptionDate, setConceptionDate] = useState("");
  const [disclosureDate, setDisclosureDate] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const create = trpc.sanjeevani.createAssessment.useMutation({
    onSuccess: (result) => { toast.success("Private assessment created."); setLocation(`/workspace/analysis/${result.analysisRunId}`); },
    onError: (error) => toast.error(error.message),
  });
  const prepareUpload = trpc.sanjeevani.prepareResearchUpload.useMutation();
  const onFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) { toast.error("Use a file smaller than 10 MB."); return; }
    setFile(selected);
    setUploadProgress(0);
  };
  const uploadPrivately = async (selected: File) => {
    const prepared = await prepareUpload.mutateAsync({ fileName: selected.name, mimeType: selected.type || "application/octet-stream" });
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", prepared.uploadUrl);
      request.setRequestHeader("Content-Type", selected.type || "application/octet-stream");
      request.upload.onprogress = (event) => { if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100)); };
      request.onerror = () => reject(new Error("Private upload failed."));
      request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`Private upload failed (${request.status}).`));
      request.send(selected);
    });
    return prepared.key;
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) { toast.error("Add a research title before continuing."); return; }
    try {
      setIsUploading(Boolean(file));
      const fileKey = file ? await uploadPrivately(file) : undefined;
      await create.mutateAsync({
        title: title.trim(), institution: institution || undefined, disclosureStatus,
        conceptionDate: conceptionDate ? new Date(conceptionDate).toISOString() : undefined,
        disclosureDate: disclosureDate ? new Date(disclosureDate).toISOString() : undefined,
        publicationDate: publicationDate ? new Date(publicationDate).toISOString() : undefined,
        fileName: file?.name, mimeType: file?.type || "application/octet-stream", fileKey, fileSizeBytes: file?.size,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create this assessment.");
    } finally { setIsUploading(false); }
  };
  return <DashboardLayout><div className="mx-auto max-w-4xl"><div className="border-b border-white/8 pb-7"><p className="mono text-[10px] uppercase tracking-[0.18em] text-primary">New private assessment</p><h1 className="editorial-display mt-2 text-4xl text-white">Start with the work as it exists.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Upload a paper, manuscript, thesis, or technical record. You will review every extracted item before any screening report is prepared.</p></div><form onSubmit={submit} className="mt-8 grid gap-6"><section className="rounded-[1.5rem] border border-white/8 bg-[#1d2032]/70 p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UploadCloud className="size-5" /></span><div><h2 className="text-base font-semibold text-white">Research work</h2><p className="mt-1 text-xs text-slate-500">PDF, DOCX, or text file · stored as a private object.</p></div></div><label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/[0.035]"><input type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="sr-only" onChange={(event) => onFile(event.target.files?.[0] ?? null)} /><FileUp className="size-6 text-primary" /><p className="mt-3 text-sm font-medium text-white">{file ? file.name : "Choose a private research file"}</p><p className="mt-1 text-xs text-slate-500">{file ? `${Math.max(1, Math.round(file.size / 1024))} KB · ${isUploading ? "uploading" : "ready to store"}` : "Maximum upload size: 10 MB"}</p>{isUploading && <div className="mt-4 w-full max-w-sm"><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${uploadProgress}%` }} /></div><p className="mt-2 mono text-[10px] text-primary">{uploadProgress}% uploaded privately</p></div>}</label></section><section className="rounded-[1.5rem] border border-white/8 bg-[#1d2032]/70 p-6"><div className="grid gap-5 md:grid-cols-2"><Field label="Working title"><Input value={title} onChange={(event) => setTitle(event.target.value)} className="border-white/10 bg-white/[0.035] text-white" placeholder="e.g., Alternative API synthesis pathway" /></Field><Field label="Institution or lab"><Input value={institution} onChange={(event) => setInstitution(event.target.value)} className="border-white/10 bg-white/[0.035] text-white" placeholder="Optional" /></Field><Field label="Disclosure status"><select value={disclosureStatus} onChange={(event) => setDisclosureStatus(event.target.value as typeof disclosureStatus)} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary"><option value="private">Private / unpublished</option><option value="internal_review">Internal review</option><option value="public_disclosure">Public disclosure</option><option value="published">Published</option></select></Field><div className="hidden md:block" /></div><div className="mt-5 grid gap-5 md:grid-cols-3"><Field label="Conception date"><Input type="date" value={conceptionDate} onChange={(event) => setConceptionDate(event.target.value)} className="border-white/10 bg-white/[0.035] text-white" /></Field><Field label="Disclosure date"><Input type="date" value={disclosureDate} onChange={(event) => setDisclosureDate(event.target.value)} className="border-white/10 bg-white/[0.035] text-white" /></Field><Field label="Publication date"><Input type="date" value={publicationDate} onChange={(event) => setPublicationDate(event.target.value)} className="border-white/10 bg-white/[0.035] text-white" /></Field></div><div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.045] p-4 text-xs leading-5 text-slate-300"><span className="font-medium text-primary">Timing note.</span> Record what you know; no universal grace period is assumed. Deadline and filing decisions require jurisdiction-specific, qualified review.</div></section><div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#131525] px-5 py-4"><div className="flex items-center gap-3 text-xs text-slate-400"><LockKeyhole className="size-4 text-primary" /> Private storage and workspace-scoped access</div><Button type="submit" disabled={create.isPending || isUploading || prepareUpload.isPending} className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">{isUploading ? "Uploading privately…" : create.isPending ? "Creating assessment…" : "Create assessment"}</Button></div></form></div></DashboardLayout>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</span>{children}</label>; }
