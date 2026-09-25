"use client";

import * as React from "react";
import Link from "next/link";

interface EvolutionEmptyProps {
  texto: string;
  acoes?: Array<{ href: string; label: string }>;
}

export function EvolutionEmpty({ texto, acoes }: EvolutionEmptyProps) {
  return (
    <div className="flex flex-col items-start gap-2 p-1">
      <p className="text-sm leading-relaxed text-muted-foreground">{texto}</p>
      {acoes && acoes.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {acoes.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
