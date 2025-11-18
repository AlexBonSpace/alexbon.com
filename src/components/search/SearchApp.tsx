"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { liteClient } from "algoliasearch/lite";
import type { Hit, SearchResponse } from "@algolia/client-search";

type AlgoliaRecord = {
  objectID: string;
  locale: string;
  title: string;
  url: string;
  type: string;
  typeLabel: string;
  typeUrl: string;
  snippet?: string;
  description?: string;
  tags?: string[];
};

type HighlightedField = {
  value: string;
};

type HighlightableHit = Hit<AlgoliaRecord> & {
  _highlightResult?: {
    title?: HighlightedField;
    snippet?: HighlightedField;
    description?: HighlightedField;
  };
};

type PaginationCopy = {
  previous: string;
  next: string;
  summaryTemplate: string;
};

export type SearchCopy = {
  label: string;
  placeholder: string;
  reset: string;
  noscript: string;
  empty: string;
  emptyDetails: string;
  readMore: string;
  pagination?: PaginationCopy;
};

type SearchStatus = "idle" | "loading" | "success" | "error";

export interface SearchAppProps {
  appId: string;
  searchApiKey: string;
  indexName: string;
  locale: string;
  initialQuery?: string;
  hitsPerPage?: number;
  copy: SearchCopy;
  showPagination?: boolean;
}

interface SearchResultState {
  hits: HighlightableHit[];
  page: number;
  nbPages: number;
  nbHits: number;
}

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const formatUrl = (value?: string) => {
  if (!value) {
    return "#";
  }
  try {
    return ensureTrailingSlash(value);
  } catch {
    return value;
  }
};

function HighlightedText({ value }: { value: string }) {
  return <span dangerouslySetInnerHTML={{ __html: value }} />;
}

function formatSummary(template: string | undefined, currentPage: number, totalPages: number) {
  if (!template) {
    return `${currentPage} / ${totalPages}`;
  }
  return template.replace(/\{current\}/gi, String(currentPage)).replace(/\{total\}/gi, String(totalPages));
}

function HitCard({ hit, readMore }: { hit: HighlightableHit; readMore: string }) {
  const highlightedTitle = hit._highlightResult?.title?.value ?? hit.title;
  const highlightedSnippet =
    hit._highlightResult?.snippet?.value ??
    hit._highlightResult?.description?.value ??
    hit.snippet ??
    hit.description ??
    "";
  const typeLabel = hit.typeLabel ?? hit.type ?? "";
  const typeHref = formatUrl(hit.typeUrl);
  const canonicalHref = formatUrl(hit.url);

  if (hit.type === "note") {
    return (
      <article className="blog-card flex w-full flex-col gap-3 rounded-3xl border border-soft p-5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-6">
        <div className="flex items-center text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {typeLabel ? (
            <a
              href={typeHref}
              className="badge-soft inline-flex items-center px-3 py-1 text-[0.65rem] leading-none transition-colors hover:bg-[#f2993f]/90 hover:text-white"
            >
              {typeLabel}
            </a>
          ) : null}
        </div>
        <h3 className="sr-only">
          <HighlightedText value={highlightedTitle} />
        </h3>
        <p className="whitespace-pre-line text-[clamp(1.1rem,3vw,1.2rem)] leading-relaxed text-strong">
          {highlightedSnippet ? <HighlightedText value={highlightedSnippet} /> : hit.title}{" "}
          <a
            href={canonicalHref}
            className="inline-flex items-center text-[1.05em] text-accent/80 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={readMore}
          >
            <span aria-hidden>🦋</span>
          </a>
        </p>
      </article>
    );
  }

  return (
    <article className="blog-card flex w-full flex-col gap-5 rounded-[2.5rem] border border-soft p-6 transition-transform duration-200 hover:-translate-y-1 sm:p-8">
      {typeLabel ? (
        <div className="flex items-center text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          <a
            href={typeHref}
            className="badge-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.65rem] leading-none transition-colors hover:bg-[#f2993f]/90 hover:text-white"
          >
            {typeLabel}
          </a>
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <h3 className="text-balance text-[clamp(1.45rem,4.5vw,2rem)] font-semibold leading-tight text-strong">
          <a href={canonicalHref} className="text-inherit transition-colors hover:text-accent">
            <HighlightedText value={highlightedTitle} />
          </a>
        </h3>
        {highlightedSnippet ? (
          <p className="whitespace-pre-line text-[clamp(1.1rem,3vw,1.2rem)] leading-relaxed text-primary">
            <HighlightedText value={highlightedSnippet} />
          </p>
        ) : null}
      </div>
      <div>
        <a
          href={canonicalHref}
          className="button-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
        >
          {readMore}
          <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  );
}

function PaginationControls({
  copy,
  currentPage,
  totalPages,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  copy: PaginationCopy | undefined;
  currentPage: number;
  totalPages: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!copy || totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between rounded-full border border-[#eadfcd]/70 bg-white/80 px-4 py-2 text-sm font-semibold text-[#3f3831] shadow-[0_18px_48px_-32px_rgba(40,30,20,0.35)]">
      {canPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-[#f4eadb] hover:text-[#2f2b26]"
        >
          ← {copy.previous}
        </button>
      ) : (
        <span className="cursor-not-allowed rounded-full px-3 py-2 text-[#b2a698] opacity-70">←</span>
      )}
      <span className="text-xs uppercase tracking-[0.3em] text-[#7c6d5d]">
        {formatSummary(copy.summaryTemplate, currentPage, totalPages)}
      </span>
      {canNext ? (
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-[#f4eadb] hover:text-[#2f2b26]"
        >
          {copy.next} →
        </button>
      ) : (
        <span className="cursor-not-allowed rounded-full px-3 py-2 text-[#b2a698] opacity-70">→</span>
      )}
    </nav>
  );
}

export function SearchApp({
  appId,
  searchApiKey,
  indexName,
  locale,
  initialQuery = "",
  hitsPerPage = 18,
  showPagination = true,
  copy,
}: SearchAppProps) {
  const client = useMemo(() => liteClient(appId, searchApiKey), [appId, searchApiKey]);

  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResultState>({
    hits: [],
    page: 0,
    nbPages: 0,
    nbHits: 0,
  });

  const previousQueryRef = useRef<string>(initialQuery);

  useEffect(() => {
    if (initialQuery !== previousQueryRef.current) {
      previousQueryRef.current = initialQuery ?? "";
      setQuery(initialQuery ?? "");
      setPage(0);
    }
  }, [initialQuery]);

  useEffect(() => {
    setPage(0);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setStatus("idle");
      setError(null);
      setResult({
        hits: [],
        page: 0,
        nbPages: 0,
        nbHits: 0,
      });
      return () => {
        cancelled = true;
      };
    }

    setStatus("loading");
    setError(null);

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("query", trimmedQuery);
      params.set("hitsPerPage", String(hitsPerPage));
      params.set("page", String(page));
      params.append("attributesToHighlight", "title");
      params.append("attributesToHighlight", "snippet");
      params.append("attributesToHighlight", "description");
      params.set("highlightPreTag", "<mark>");
      params.set("highlightPostTag", "</mark>");
      params.append("analyticsTags", locale);

      client
        .searchForHits<AlgoliaRecord>({
          requests: [
            {
              indexName,
              params: params.toString(),
            },
          ],
        })
        .then((payload) => {
          if (cancelled) return;
          const [response] = (payload.results ?? []) as SearchResponse<AlgoliaRecord>[];
          if (!response) {
            setResult({
              hits: [],
              page: 0,
              nbPages: 0,
              nbHits: 0,
            });
            setStatus("success");
            return;
          }

          setResult({
            hits: response.hits as HighlightableHit[],
            page: response.page,
            nbPages: response.nbPages,
            nbHits: response.nbHits,
          });
          setStatus("success");
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setStatus("error");
          setError(err instanceof Error ? err.message : "Unknown error");
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [client, indexName, query, page, hitsPerPage, locale]);

  const hasQuery = query.trim().length > 0;
  const canPrevious = result.page > 0;
  const canNext = result.page + 1 < result.nbPages;
  const currentPageDisplay = result.nbPages > 0 ? result.page + 1 : 0;
  const totalPagesDisplay = result.nbPages;

  const showEmptyState = hasQuery && status === "success" && result.nbHits === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="blog-card flex flex-col gap-3 rounded-[2rem] border border-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6">
        <label className="flex w-full flex-col gap-2 text-sm font-semibold text-primary sm:flex-1">
          {copy.label}
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            type="search"
            placeholder={copy.placeholder}
            className="w-full rounded-full border border-soft bg-surface px-4 py-3 text-base font-normal text-strong shadow-inner outline-none transition focus:border-accent focus:text-strong"
            spellCheck="false"
          />
        </label>
        <button
          type="button"
          onClick={() => setQuery("")}
          disabled={query.length === 0}
          className="nav-pill inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-base font-semibold transition-colors disabled:opacity-40"
        >
          {copy.reset}
        </button>
      </div>

      {hasQuery && status === "error" ? (
        <div className="blog-card col-span-full flex flex-col items-center gap-3 rounded-[2rem] border border-soft p-10 text-center text-primary">
          <p className="text-xl font-semibold text-strong">Algo­liа тимчасово недоступна</p>
          <p className="text-sm text-muted">{error ?? "Спробуйте пізніше або оновіть сторінку."}</p>
        </div>
      ) : null}

      {hasQuery && status === "loading" ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="blog-card h-44 animate-pulse rounded-[2.5rem] border border-soft bg-surface/50"
            />
          ))}
        </div>
      ) : null}

      {showEmptyState ? (
        <div className="blog-card col-span-full flex flex-col items-center gap-3 rounded-[2rem] border border-soft p-10 text-center text-primary">
          <p className="text-xl font-semibold text-strong">{copy.empty}</p>
          <p className="text-sm">{copy.emptyDetails}</p>
        </div>
      ) : null}

      {hasQuery && status === "success" && result.hits.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.hits.map((hit) => (
            <HitCard key={hit.objectID} hit={hit} readMore={copy.readMore} />
          ))}
        </div>
      ) : null}

      {showPagination && hasQuery ? (
        <PaginationControls
          copy={copy.pagination}
          currentPage={currentPageDisplay}
          totalPages={totalPagesDisplay}
          canPrevious={canPrevious}
          canNext={canNext}
          onPrevious={() => canPrevious && setPage((value) => Math.max(0, value - 1))}
          onNext={() => canNext && setPage((value) => value + 1)}
        />
      ) : null}

      <noscript>
        <p className="text-xs font-medium text-muted">{copy.noscript}</p>
      </noscript>
    </div>
  );
}

export default SearchApp;
