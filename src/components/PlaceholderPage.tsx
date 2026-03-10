interface Props {
  title: string;
}

export function PlaceholderPage({ title }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-0px)]">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}
