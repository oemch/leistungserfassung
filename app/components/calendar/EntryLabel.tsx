"use client";

import { Ticket } from "lucide-react";
import { SiJira } from "react-icons/si";
import { extractJiraTicketId, getJiraUrl, isProjectEntry, labelWithoutTicketId, isItsmTicketId } from "@/lib/jira";
import { getItsmUrl } from "@/lib/itsm";

interface EntryLabelProps {
  text: string;
  fg: string;
  className?: string;
  style?: React.CSSProperties;
}

export function EntryLabel({ text, fg, className = "", style }: EntryLabelProps) {
  const ticketId = extractJiraTicketId(text);
  const isProject = isProjectEntry(text);
  const itsm = ticketId ? isItsmTicketId(ticketId) : false;

  if (!isProject || !ticketId) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }

  const url = itsm ? getItsmUrl(ticketId) : getJiraUrl(ticketId);
  const displayName = labelWithoutTicketId(text, ticketId);
  const LinkIcon = itsm ? Ticket : SiJira;
  const linkLabel = itsm ? `ITSM-Ticket ${ticketId} öffnen` : `Jira-Ticket ${ticketId} öffnen`;
  const linkClass = itsm
    ? "text-amber-700 hover:text-amber-800"
    : "text-blue-600 hover:text-blue-700";
  return (
    <span className={`flex flex-col gap-0.5 min-w-0 ${className}`} style={style}>
      {displayName ? <span className="truncate">{displayName}</span> : null}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 w-fit ${linkClass} transition-colors text-xs`}
        aria-label={linkLabel}
      >
        <span className={itsm ? "inline-flex shrink-0 -translate-y-px" : "inline-flex shrink-0"}>
          <LinkIcon size={12} aria-hidden className={itsm ? "text-amber-700" : "text-blue-600"} />
        </span>
        {ticketId}
      </a>
    </span>
  );
}
