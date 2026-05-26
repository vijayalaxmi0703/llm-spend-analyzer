const faqs = [
  {
    question: 'How does Credex Audit keep my data private?',
    answer: 'Audit submissions are stored securely in Supabase and only used to generate the report. No login is required and no billing credentials are requested.'
  },
  {
    question: 'How accurate are the savings estimates?',
    answer: 'We use rules-based finance logic tied to team size, plan fit, and API spend patterns. The recommendations are conservative and designed to be defensible.'
  },
  {
    question: 'Will this replace my subscription billing tools?',
    answer: 'No. This report is a diagnostic layer for AI spend. It is meant to highlight waste and better plan matches, not to manage billing directly.'
  },
  {
    question: 'Can my whole team use this?',
    answer: 'Yes. The report is shareable and meant for founders, operators, and finance partners to discuss together.'
  }
];

export function FAQList() {
  return (
    <div className="space-y-4">
      {faqs.map((item) => (
        <div key={item.question} className="rounded-lg border border-accent-primary/10 bg-elevated/40 p-6 text-sm text-text-muted shadow-soft hover:bg-elevated/60 transition">
          <p className="font-semibold text-text-primary">{item.question}</p>
          <p className="mt-2 leading-7">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
