import { Card, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-96 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardContent className="p-6"><div className="h-16 rounded-lg bg-muted" /></CardContent></Card>
        <Card><CardContent className="p-6"><div className="h-16 rounded-lg bg-muted" /></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="mt-3 h-8 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-16">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted" />
          <div className="mx-auto mt-6 h-6 w-48 rounded-lg bg-muted" />
          <div className="mx-auto mt-3 h-4 w-72 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

export function ScanSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-80 rounded-lg bg-muted" />
      </div>
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted p-12">
            <div className="h-16 w-16 rounded-2xl bg-muted" />
            <div className="mt-4 h-6 w-56 rounded-lg bg-muted" />
            <div className="mt-2 h-4 w-40 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
