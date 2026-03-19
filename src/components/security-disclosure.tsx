"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Lock } from "lucide-react";
import { useLocale } from "@/components/language-provider";

/**
 * SecurityDisclosure component provides transparency about the AI's limitations,
 * third-party data processing, and legal status of the financial analysis.
 */
export function SecurityDisclosure() {
  const { messages } = useLocale();
  const copy = messages.securityDisclosure;

  return (
    <div className="space-y-4 my-6">
      <Alert variant="destructive" className="border-red-500/50 bg-red-50/10">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold text-red-600">{copy.riskTitle}</AlertTitle>
        <AlertDescription className="text-sm space-y-2 mt-2">
          <p>
            1. <strong>{copy.riskOneTitle}</strong>: {copy.riskOne}
          </p>
          <p>
            2. <strong>{copy.riskTwoTitle}</strong>: {copy.riskTwo}
          </p>
          <p>
            3. <strong>{copy.riskThreeTitle}</strong>: {copy.riskThree}
          </p>
        </AlertDescription>
      </Alert>

      <Alert className="border-blue-500/50 bg-blue-50/10">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="font-bold text-blue-600">{copy.privacyTitle}</AlertTitle>
        <AlertDescription className="text-sm space-y-2 mt-2">
          <p>{copy.privacyIntro}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>{copy.piiTitle}</strong>: {copy.privacyOne}
            </li>
            <li>
              <strong>{copy.encryptionTitle}</strong>: {copy.privacyTwo}
            </li>
            <li>
              <strong>{copy.thirdPartyTitle}</strong>: {copy.privacyThree}
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
