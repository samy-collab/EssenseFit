import { ReactNode } from "react";

export function SectionIntro({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-theme pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="pill">{eyebrow}</p>
        <h2 className="section-title mt-4">{title}</h2>
        <p className="mt-3 text-base leading-7 text-theme-secondary">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
