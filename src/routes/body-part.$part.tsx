import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ScoreGauge } from "@/components/ScoreGauge";
import { bodyParts, type BodyPartKey } from "@/lib/body-parts";

type Search = { from?: "session" | "overview" };

export const Route = createFileRoute("/body-part/$part")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    from: s.from === "session" ? "session" : "overview",
  }),
  component: BodyPartDetail,
});

function StatusPill({ status }: { status: "Severe" | "Moderate" | "Balanced" }) {
  const cls =
    status === "Severe" ? "bg-destructive/15 text-destructive" :
    status === "Moderate" ? "bg-warning/15 text-warning" :
    "bg-success/15 text-success";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{status}</span>;
}

function BodyPartDetail() {
  const { part } = useParams({ from: "/body-part/$part" });
  const data = bodyParts[part as BodyPartKey] ?? bodyParts.head;
  const statusCls =
    data.status === "Severe" ? "bg-destructive/15 text-destructive" :
    data.status === "Moderate" ? "bg-warning/15 text-warning" :
    "bg-success/15 text-success";

  return (
    <div className="space-y-4 fold:grid fold:grid-cols-2 fold:gap-4 land:gap-x-6 fold:space-y-0 fold:items-start">
      <div className="flex items-center justify-between fold:col-span-2">
        <Link to="/" className="inline-flex items-center gap-1 text-base font-semibold">
          <ChevronLeft className="h-5 w-5" /> {data.name}
        </Link>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusCls}`}>{data.status}</span>
      </div>

      <section className="glass-card p-4 fold:col-start-1 fold:row-start-2 fold:row-span-2 fold:sticky fold:top-[72px]">
        <div className="text-xs text-muted-foreground mb-1">Average score</div>
        <ScoreGauge value={data.score} size={120} />

        <div className="mt-4">
          <h3 className="font-semibold text-sm">Deviation Over Time</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Joint deviation trend</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} domain={[0, 20]} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                <Line type="monotone" dataKey="a" name={data.legend.a} stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="b" name={data.legend.b} stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="c" name={data.legend.c} stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="space-y-3 fold:col-start-2 fold:row-start-2">
        <h2 className="font-semibold text-sm">Insights</h2>
        {data.insights.map((i) => (
          <div key={i.title} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-xs">{i.title}</h3>
              <StatusPill status={i.status} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Avg Tilt</span>
              <span className="flex items-center gap-1 font-medium">
                {i.avgTilt}
                {i.deltaDirection === "up"
                  ? <TrendingUp className="h-3 w-3 text-destructive" />
                  : <TrendingDown className="h-3 w-3 text-success" />}
                <span className={i.deltaDirection === "up" ? "text-destructive" : "text-success"}>{i.delta}</span>
              </span>
            </div>
            {i.mainRisk && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-[11px]">
                <div className="flex items-center gap-1 font-semibold text-destructive">
                  <AlertTriangle className="h-3 w-3" /> Main Risk
                </div>
                <div className="mt-0.5 text-foreground/80">{i.mainRisk}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="glass-card p-4 fold:col-start-2 fold:row-start-3">
        <h3 className="font-semibold text-sm mb-2">Risk Assessment</h3>
        <ul className="space-y-2 text-xs">
          {data.riskAssessment.map((r) => (
            <li key={r.title} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span><span className="font-semibold">{r.title}</span> – <span className="text-foreground/80">{r.body}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
