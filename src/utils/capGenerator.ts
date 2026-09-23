import { RiskLevel } from "../types";

/**
 * OASIS COMMON ALERTING PROTOCOL (CAP) v1.2 GENERATOR: PROTOTYPE / EXERCISE ONLY
 *
 * Every payload is marked status=Exercise with an explicit note. HydroGuard is not connected to any
 * alerting authority; nothing generated here is an official alert. The sender, contacts and web link
 * are placeholders on purpose.
 *
 * Element order follows the CAP 1.2 schema (alert: identifier, sender, sent, status, msgType, scope,
 * code, note, info; info: ... area with areaDesc, circle, altitude).
 */

export interface CapAlertParameters {
  identifier?: string;
  sentAt?: Date;
  headline: string;
  description: string;
  instruction: string;
  villageName: string;
  cluster: string;
  lat: number;
  lon: number;
  /** Village elevation in metres above sea level. CAP altitude is in feet, converted below. */
  elevationM?: number;
  leadTimeDisplay: string;
  riskLevel: RiskLevel;
}

interface TierMapping {
  urgency: "Immediate" | "Expected" | "Future";
  severity: "Extreme" | "Severe" | "Moderate" | "Minor";
  certainty: "Observed" | "Likely" | "Possible" | "Unlikely";
  responseType: "Evacuate" | "Prepare" | "Monitor" | "None";
}

/** Modelled risk is a forecast, so certainty is never "Observed". */
export const CAP_TIER_MAPPING: Record<RiskLevel, TierMapping> = {
  SEVERE: {
    urgency: "Immediate",
    severity: "Severe",
    certainty: "Likely",
    responseType: "Evacuate",
  },
  HIGH: {
    urgency: "Expected",
    severity: "Moderate",
    certainty: "Possible",
    responseType: "Prepare",
  },
  MEDIUM: {
    urgency: "Future",
    severity: "Minor",
    certainty: "Possible",
    responseType: "Monitor",
  },
  LOW: {
    urgency: "Future",
    severity: "Minor",
    certainty: "Unlikely",
    responseType: "None",
  },
};

const FEET_PER_METRE = 3.28084;
const CIRCLE_RADIUS_KM = 3.5;

export function generateCapXml(params: CapAlertParameters): string {
  const now = params.sentAt ?? new Date();
  const stamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 12);
  const id =
    params.identifier ||
    `HYDROGUARD-EXERCISE-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
  const sent = now.toISOString();
  const expires = new Date(now.getTime() + 4 * 3600 * 1000).toISOString();
  const tier = CAP_TIER_MAPPING[params.riskLevel];
  const altitudeLine =
    typeof params.elevationM === "number"
      ? `\n      <altitude>${Math.round(params.elevationM * FEET_PER_METRE)}</altitude>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${escapeXml(id)}</identifier>
  <sender>prototype@hydroguard.example</sender>
  <sent>${sent}</sent>
  <status>Exercise</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>HYDROGUARD-PROTOTYPE</code>
  <note>PROTOTYPE EXERCISE - NOT AN OFFICIAL ALERT. Generated from modelled data by an uncalibrated prototype. Do not act on or forward this message.</note>
  <info>
    <language>en-IN</language>
    <category>Met</category>
    <event>Flash flood risk (exercise)</event>
    <responseType>${tier.responseType}</responseType>
    <urgency>${tier.urgency}</urgency>
    <severity>${tier.severity}</severity>
    <certainty>${tier.certainty}</certainty>
    <expires>${expires}</expires>
    <senderName>HydroGuard prototype (no live contact)</senderName>
    <headline>${escapeXml(params.headline)}</headline>
    <description>${escapeXml(params.description)} (Estimated wave travel time from trigger point: ${escapeXml(params.leadTimeDisplay)}, assumption-based)</description>
    <instruction>${escapeXml(params.instruction)}</instruction>
    <parameter>
      <valueName>RiskTier</valueName>
      <value>${params.riskLevel}</value>
    </parameter>
    <parameter>
      <valueName>TravelTimeFormula</valueName>
      <value>Distance / assumed wave speed [2-5 m/s, uncalibrated]</value>
    </parameter>
    <area>
      <areaDesc>${escapeXml(params.villageName)}, ${escapeXml(params.cluster)}, Chamoli, Uttarakhand</areaDesc>
      <circle>${params.lat.toFixed(4)},${params.lon.toFixed(4)} ${CIRCLE_RADIUS_KM}</circle>${altitudeLine}
    </area>
  </info>
</alert>`.trim();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function downloadCapXmlFile(
  xmlContent: string,
  filename = "hydroguard-cap-exercise.xml",
): void {
  const blob = new Blob([xmlContent], {
    type: "application/xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
