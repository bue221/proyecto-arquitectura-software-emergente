type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="max-w-2xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl">{title}</h1>
      <p className="text-base text-muted-foreground md:text-lg">{description}</p>
    </header>
  );
}
