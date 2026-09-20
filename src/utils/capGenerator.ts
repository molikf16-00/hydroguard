import { VillageData, RiskLevel } from '../types';

/**
 * OASIS COMMON ALERTING PROTOCOL (CAP) v1.2 GENERATOR
 *
 * Formats standardized international CAP XML payloads for downstream
 * dissemination across Cell Broadcast Centers (CBC), NDMA Sachet portal,
 * local LoRa relays, and siren gateways.
 */

export interface CapAlertParameters {
  identifier?: string;
  sender?: string;
  sentIso?: string;
  headline: string;
  description: string;
  instruction: string;
  villageName: string;
  cluster: string;
  lat: number;
  lon: number;
  leadTimeDisplay: string;
  urgency?: 'Immediate' | 'Expected' | 'Future';
  severity?: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  certainty?: 'Observed' | 'Likely' | 'Possible';
}

export function generateCapXml(params: CapAlertParameters): string {
  const now = new Date();
  const id = params.identifier || `IN-UK-HG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const sent = params.sentIso || now.toISOString();
  const expires = new Date(now.getTime() + 4 * 3600 * 1000).toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${id}</identifier>
  <sender>hydroguard-ops@sdma.uk.gov.in</sender>
  <sent>${sent}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <codeValue>IMD-HYDRO-FLASH-04</codeValue>
  <info>
    <language>en-IN</language>
    <category>Met</category>
    <event>Flash Flood Emergency Warning</event>
    <responseType>Evacuate</responseType>
    <urgency>${params.urgency || 'Immediate'}</urgency>
    <severity>${params.severity || 'Extreme'}</severity>
    <certainty>${params.certainty || 'Observed'}</certainty>
    <eventCode>
      <valueName>NDMA-CAP-Standard</valueName>
      <value>FLASH_FLOOD_RED</value>
    </eventCode>
    <expires>${expires}</expires>
    <senderName>Uttarakhand SDMA / HydroGuard Autonomous EWS</senderName>
    <headline>${escapeXml(params.headline)}</headline>
    <description>${escapeXml(params.description)} (Estimated Arrival Horizon: ${params.leadTimeDisplay})</description>
    <instruction>${escapeXml(params.instruction)}</instruction>
    <web>https://hydroguard.uk.gov.in/alerts/${id}</web>
    <contact>District Emergency Operations Center (DEOC) Chamoli: 01372-251437 / 1077</contact>
    <parameter>
      <valueName>HydrologicalCatchment</valueName>
      <value>Rishi Ganga - Alaknanda Basin (Chamoli District)</value>
    </parameter>
    <parameter>
      <valueName>KinematicLeadTimeFormula</valueName>
      <value>Distance / Velocity [2-5 m/s]</value>
    </parameter>
    <area>
      <areaDesc>${escapeXml(params.villageName)}, ${escapeXml(params.cluster)}, Chamoli, Uttarakhand</areaDesc>
      <circle>${params.lat.toFixed(4)},${params.lon.toFixed(4)},3.5</circle>
      <altitude>1820</altitude>
    </area>
  </info>
</alert>`.trim();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadCapXmlFile(xmlContent: string, filename = 'hydroguard-alert-cap1.2.xml'): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
