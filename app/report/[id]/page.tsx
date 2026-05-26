import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

/** Legacy route — public audits live at /audit/[id] */
export default async function LegacyReportRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/audit/${id}`);
}
