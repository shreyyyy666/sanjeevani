import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ScreeningSignals({ assessmentCount }: { assessmentCount: number }) {
  const data = [
    { stage: "Upload", value: assessmentCount },
    { stage: "Review", value: assessmentCount },
    { stage: "Evidence", value: Math.max(0, assessmentCount - 1) },
    { stage: "Report", value: Math.max(0, assessmentCount - 1) },
  ];
  return <div className="h-56 w-full" role="img" aria-label="Assessment flow chart showing upload, review, evidence, and report stages"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" /><XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: "#8a8da5", fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8a8da5", fontSize: 10 }} /><Tooltip cursor={{ fill: "rgba(77,227,211,0.06)" }} contentStyle={{ background: "#161828", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#f5f5f7", fontSize: 12 }} /><Bar dataKey="value" fill="#4de3d3" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
