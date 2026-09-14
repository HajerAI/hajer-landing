import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { privacyPolicy } from "@/content/legal";

export const metadata = legalMetadata(privacyPolicy);

export default function PrivacyPage() {
  return <LegalPage doc={privacyPolicy} />;
}
