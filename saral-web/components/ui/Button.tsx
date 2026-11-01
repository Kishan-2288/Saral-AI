import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icons";

interface Props {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  track?: string;
  icon?: IconName;
  opensNewTab?: string;
  className?: string;
}

export default function Button({ href, children, variant = "primary", external, track, icon, opensNewTab, className = "" }: Props) {
  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`;
  const content = (<>{icon && <Icon name={icon} size={20} />}<span>{children}</span>{external && opensNewTab && <span className="sr-only"> {opensNewTab}</span>}</>);
  if (external) return <a href={href} className={cls} target="_blank" rel="noopener noreferrer" data-track={track}>{content}</a>;
  return <Link href={href} className={cls} data-track={track}>{content}</Link>;
}
