'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function GameLoadingSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white overflow-hidden w-full h-[70dvh] md:h-[80dvh] flex flex-col">
      <div className="bg-slate-50 p-8 flex flex-col items-center justify-center gap-6 shrink-0 h-48 md:h-64">
        <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-2xl" />
        <div className="space-y-2 flex flex-col items-center w-full max-w-sm">
          <Skeleton className="h-8 md:h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <CardContent className="p-6 md:p-10 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-16 md:h-20 rounded-2xl" />
          <Skeleton className="h-16 md:h-20 rounded-2xl" />
          <Skeleton className="h-16 md:h-20 rounded-2xl md:block hidden" />
        </div>
        <Skeleton className="h-14 md:h-16 w-full rounded-2xl mt-auto" />
      </CardContent>
    </Card>
  );
}