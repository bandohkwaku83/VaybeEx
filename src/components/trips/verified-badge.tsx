import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="verified" className={className}>
      <BadgeCheck className="h-3 w-3" />
      Verified
    </Badge>
  );
}
