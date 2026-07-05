import { redirect } from 'next/navigation';

// /academy was an early prototype — the full lessons hub lives at /learn
export default function AcademyPage() {
  redirect('/learn');
}
