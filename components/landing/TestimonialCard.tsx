import { Card } from '@/components/ui/card';

interface TestimonialCardProps {
  quote: string;
  author: string;
  company: string;
}

export function TestimonialCard({ quote, author, company }: TestimonialCardProps) {
  return (
    <Card className="rounded-lg p-8">
      <p className="text-base leading-8 text-text-primary">&quot;{quote}&quot;</p>
      <div className="mt-6 space-y-1 text-sm text-text-muted">
        <p className="font-semibold text-text-primary">{author}</p>
        <p className="text-accent-primary/70">{company}</p>
      </div>
    </Card>
  );
}
