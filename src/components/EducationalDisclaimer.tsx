import { CONTENT_LAST_REVIEWED, EDUCATIONAL_DISCLAIMER } from '@/config/content';
import { cn } from '@/lib/utils';

/** Small, quiet footer shown under learning content (lessons, quests, games). */
export function EducationalDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn('text-[11px] leading-relaxed text-muted-foreground text-center max-w-2xl mx-auto', className)}>
      {EDUCATIONAL_DISCLAIMER} <span className="whitespace-nowrap">Content last reviewed: {CONTENT_LAST_REVIEWED}.</span>
    </p>
  );
}
