import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, DataTable, PageHeader, SourceBadge } from "@/components/ui";
import { sourceDocuments } from "@/lib/data/club-reference";

const provenance = [
  [
    "Official public information",
    "Reserved for public facts in a real implementation; unused in this fictional demonstration",
    "None used",
  ],
  [
    "User-provided source document",
    "Reserved for authorized source documents in a real implementation",
    "None used",
  ],
  [
    "Synthetic demonstration data",
    "Attendance, supporter behavior, contract workflow, campaigns, forecasts and impact values",
    "Deterministic seed; never claimed as club results",
  ],
  [
    "User-entered operational data",
    "Validated manual and CSV records entered by authorized staff",
    "Attributed to actor, batch, and timestamp",
  ],
  [
    "Calculated metric",
    "KPI and financial result derived from stored records",
    "Formula and calculation version retained",
  ],
  [
    "Forecast or scenario",
    "Planning result driven by explicit assumptions",
    "Editable; never presented as an actual result",
  ],
  [
    "Documented assumption",
    "Operating or methodological choice awaiting stakeholder validation",
    "Recorded in BA and production-readiness artifacts",
  ],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About & provenance"
        title="About This Project"
        description="This portfolio case study demonstrates a credible operating model while keeping synthetic records, calculations, and assumptions unmistakably separate."
      />
      <div className="grid-2">
        <Card className="case-section radar-panel">
          <p className="eyebrow">Portfolio disclosure</p>
          <h2>Larkmoor Athletic is a fictional club.</h2>
          <p>
            Independent portfolio project. All club, sponsor, opponent, venue and supporter data is
            synthetic. It is not affiliated with or endorsed by any club.
          </p>
          <p>
            The configurable `PORTFOLIO_DISCLAIMER` presentation flag allows an authorized future
            implementation to remove this framing only after ownership, legal, data, security,
            hosting, and acceptance approvals.
          </p>
        </Card>
        <Card className="case-section">
          <p className="eyebrow">Fictional setting</p>
          <h2>The invented club</h2>
          <ul>
            <li>Larkmoor Athletic plays in the fictional town of Larkmoor.</li>
            <li>The men’s program joined Meridian League Men for the 2026 season.</li>
            <li>The women’s program joined the Meridian League Women for the 2026 season.</li>
          </ul>
        </Card>
      </div>
      <Card className="padded">
        <CardHeader
          title="Data Provenance Classification"
          description="Every metric, record, or claim must fall into one of these seven classes."
        />
        <div className="provenance-grid">
          {provenance.map(([name, content, control]) => (
            <div className="provenance-item" key={name}>
              <SourceBadge source={name as Parameters<typeof SourceBadge>[0]["source"]} />
              <p style={{ marginTop: 10 }}>{content}</p>
              <p style={{ marginTop: 7 }}>
                <strong>Control:</strong> {control}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="padded section-gap">
        <CardHeader
          title="Published Data-asset Register"
          description="Only synthetic, reproducible inputs and outputs available in this repository"
          action={<ShieldCheck size={18} />}
        />
        <DataTable
          caption="Published data asset register"
          headers={["Source", "Coverage", "File", "SHA-256"]}
          rows={sourceDocuments.map((source) => [
            <strong key="name">{source.name}</strong>,
            source.coverage,
            source.file,
            <code key="hash" title={source.sha256}>
              {source.sha256.slice(0, 12)}…
            </code>,
          ])}
        />
        <div className="callout section-gap">
          <ShieldCheck size={18} />
          <div>
            <strong>Interpretation controls</strong>
            <p>
              These assets are synthetic demonstration data, not audited club financial statements.
              Monthly and category views reconcile to the same annual controls and must not be
              summed together. Invented operating values remain planning assumptions, not club
              results or approved forecasts. Run <code>npm run data:build</code> and inspect the
              reconciliation output before using any figure.
            </p>
          </div>
        </div>
      </Card>
      <Card className="padded section-gap">
        <CardHeader
          title="Brand Asset Boundary"
          description="The crest is an original design made for this fictional club."
        />
        <p style={{ color: "#637283", fontSize: 11, lineHeight: 1.65 }}>
          The asset lives at <code>public/brand/larkmoor-crest.png</code>.
        </p>
        <Link href="/case-study" className="button button-secondary">
          Explore the case study
        </Link>
      </Card>
    </>
  );
}
