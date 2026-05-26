import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { FAQList } from '@/components/landing/FAQList';
import { HomeCTA } from '@/components/landing/HomeCTA';

const tools = ['Copilot', 'Claude', 'ChatGPT', 'Anthropic API', 'Gemini', 'Cursor'];

const stats = [
  { label: 'Average savings', value: '$1.8k/mo' },
  { label: 'Founder reviews', value: '4.9/5' },
  { label: 'Tools audited', value: '34+' }
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden px-6 pb-24 pt-10 sm:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-hero-fade opacity-80" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-accent-primary/20 bg-accent-primary/5 px-4 py-2 text-sm text-accent-primary shadow-soft">
              <Sparkles className="h-4 w-4" />
              Built for founders who want AI spend to feel strategic — not wasteful.
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
                Audit your AI spend, stop subscription overlap, and reclaim runway.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-text-muted">
                Credex Audit turns complex AI bills into clear savings, finance-defensible recommendations, and an
                instantly shareable founder report.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <HomeCTA label="Audit My AI Spend" className="w-full sm:w-auto" />
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-accent-primary"
              >
                See how it works <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-accent-primary/10 bg-elevated/30 p-5 text-center"
                >
                  <p className="text-3xl font-bold text-accent-primary">{item.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden p-8">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-primary/10 to-transparent"
              aria-hidden="true"
            />
            <p className="text-xs uppercase tracking-widest text-accent-primary">Founder-Focused Audit</p>
            <h2 className="mt-4 text-3xl font-bold text-text-primary">One report for every AI line item.</h2>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              Push your monthly AI spend into one place, compare vendor plans, and see premium recommendations before you
              spend another dollar.
            </p>
            <div className="mt-8 space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool}
                  className="flex items-center justify-between rounded-lg border border-accent-primary/10 bg-elevated/40 px-4 py-3 text-sm text-text-primary transition hover:bg-elevated/60"
                >
                  <span>{tool}</span>
                  <span className="rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary">
                    Supported
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section id="how-it-works" className="grid gap-8 lg:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Submit your tool stack',
              body: 'Enter your current AI subscriptions, team seats, and API spend. The audit stays private and never requires a login.'
            },
            {
              step: '2',
              title: 'See money wasted instantly',
              body: 'The engine finds enterprise overkill, duplicate seats, API spend leaks, and better plan matches with transparent savings math.'
            },
            {
              step: '3',
              title: 'Get a shareable founder report',
              body: 'Generate a public /audit/[id] link for board review, investor updates, or team alignment.'
            }
          ].map((item) => (
            <Card key={item.step} className="space-y-6 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10 text-lg font-bold text-accent-primary">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-text-primary">{item.title}</h3>
              <p className="text-sm leading-7 text-text-muted">{item.body}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-7 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-text-primary">Why founders choose Credex Audit</h2>
            <p className="max-w-2xl text-lg leading-8 text-text-muted">
              We build recommendations like a SaaS CFO: cost-efficient, tool-context aware, and sensitive to small-team
              budgets.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <FeatureCard
                title="Enterprise overkill"
                description="Spot when a $150 seat plan is costing more than your whole team."
                icon={ShieldCheck}
              />
              <FeatureCard
                title="Duplicate stacks"
                description="Identify overlapping copilots, research suites, and premium writer licenses."
                icon={TrendingUp}
              />
              <FeatureCard
                title="API optimization"
                description="Compare direct API usage versus credits, bursty workload discounts, and vendor bundles."
                icon={Sparkles}
              />
            </div>
          </div>
          <Card className="rounded-lg bg-gradient-to-br from-card-bg to-elevated p-8">
            <p className="text-xs uppercase tracking-widest text-accent-primary">Mock Savings Examples</p>
            <div className="mt-8 space-y-6">
              <div className="rounded-lg border border-accent-primary/10 bg-elevated/60 p-6">
                <p className="text-xl font-bold text-accent-primary">$2,000 / mo</p>
                <p className="mt-2 text-sm text-text-muted">Copilot Team + OpenAI API undiscussed credit savings.</p>
              </div>
              <div className="rounded-lg border border-accent-primary/10 bg-elevated/60 p-6">
                <p className="text-xl font-bold text-accent-primary">$860 / mo</p>
                <p className="mt-2 text-sm text-text-muted">Overlapping Claude and ChatGPT subscription tiers.</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <h2 className="text-4xl font-bold text-text-primary">Loved by early founders</h2>
          <div className="grid gap-5 lg:grid-cols-3">
            <TestimonialCard
              quote="Credex found duplicate seats across Copilot and Claude in minutes."
              author="Ravi, founder"
              company="GrowthLoop"
            />
            <TestimonialCard
              quote="The summary is concise, credible, and exactly what I needed for our operating partner."
              author="Mina, COO"
              company="LaunchCraft"
            />
            <TestimonialCard
              quote="Concrete plan swaps and a clear call-to-action for consults."
              author="Dan, product lead"
              company="StudioZen"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-text-primary">Frequently asked questions</h2>
            <FAQList />
          </div>
          <Card className="rounded-lg p-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-accent-primary">Launch-Ready CTA</p>
              <h3 className="text-3xl font-bold text-text-primary">Ready to stop hidden AI spend?</h3>
              <p className="text-sm leading-7 text-text-muted">
                From founders to scaling teams, Credex Audit makes AI budget decisions precise and action-oriented.
              </p>
              <HomeCTA label="Start your audit" className="w-full" />
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
