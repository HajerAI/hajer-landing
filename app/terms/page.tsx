import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { termsOfService } from "@/content/legal";

export const metadata = legalMetadata(termsOfService);

export default function TermsPage() {
  return <LegalPage doc={termsOfService} />;
}
