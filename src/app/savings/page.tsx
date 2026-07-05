import { redirect } from 'next/navigation';

// Virtual savings are part of the quest wallet — tracked in /quests
export default function SavingsPage() {
  redirect('/quests');
}
