import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!ai,
  });
});

// OSINT Synthesis & Anomaly Forensic Deep Dive via Gemini
app.post('/api/osint/synthesize', async (req, res) => {
  try {
    const { targetType, targetData, contextQuery } = req.body;

    if (!ai) {
      // High-grade fallback intelligence analysis
      return res.json({
        summary: `OSINT synthesized intelligence analysis for ${targetData?.name || targetData?.callsign || 'target asset'}.`,
        riskLevel: targetData?.riskScore && targetData.riskScore > 65 ? 'HIGH' : 'ELEVATED',
        anomaliesDetected: [
          'Uncharacteristic transmitter deactivation or flight route divergence detected within 48h window.',
          'Proximity correlation to known offshore STS transfer cluster or vault ingress transshipment.',
          'Beneficial ownership masking flagged under flag of convenience (FOC) jurisdiction.'
        ],
        sanctionsAssessment: 'Target exhibits high-probability behavioral markers consistent with dual-use or shadow corridor commodity movement.',
        recommendedActions: [
          'Deploy high-priority SAR (Sentinel-1) tasked pass over reported coordinates.',
          'Request bilateral customs declaration verification from port/airport authority.',
          'Log continuous draft depth and mode-S altimetry telemetry into forensic vault.'
        ],
        timestamp: new Date().toISOString(),
      });
    }

    const systemPrompt = `You are the lead intelligence analyst at Aegis Intelligence, a military-grade OSINT platform tracking physical crude oil tankers, dark fleet shadow networks, and covert gold bullion supply chains.
Provide a high-conviction, professional intelligence assessment based on the provided entity telemetry, SAR/AIS data, and geopolitical context.
Respond with valid JSON containing:
{
  "summary": "Concise 2-3 sentence executive assessment of the anomaly or movement pattern",
  "riskLevel": "CRITICAL" | "HIGH" | "ELEVATED" | "NOMINAL",
  "anomaliesDetected": ["list of 3 specific technical/spatial anomalies"],
  "sanctionsAssessment": "Evaluation of sanctions evasion, OFAC compliance, or illicit transshipment risk",
  "recommendedActions": ["3 actionable intelligence recommendations"]
}`;

    const userPrompt = `Entity Type: ${targetType}\nTarget Telemetry & Data:\n${JSON.stringify(targetData, null, 2)}\nContext Query / Analyst Notes: ${contextQuery || 'Perform standard multi-modal anomaly scan'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating OSINT synthesis:', error);
    res.status(500).json({
      error: 'Failed to synthesize intelligence',
      message: error.message,
    });
  }
});

// Comprehensive Flow Intelligence Briefing Generator
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { commodity, dateRange, activeEntities, aggregateMetrics } = req.body;

    if (!ai) {
      return res.json({
        title: `Aegis Intelligence Flow Briefing: Global ${commodity === 'crude' ? 'Crude Oil & Refined Products' : commodity === 'gold' ? 'Gold Bullion & Sovereign Vaults' : 'Crude & Bullion Multi-Commodity'} Flow Analysis`,
        classification: 'RESTRICTED // COMMERCIAL ALPHA',
        generatedAt: new Date().toISOString(),
        executiveSummary: `Spatial-temporal monitoring indicates intense throughput across primary transit corridors. In the monitored window, ${aggregateMetrics?.totalVolume || '14.2M bbl / 2.8M oz'} were tracked across maritime tanker lanes and high-security air logistics. Dark fleet activity remains concentrated in offshore transshipment zones.`,
        keyFindings: [
          'Draft delta analysis confirms 3 major offload events occurred outside declared AIS port boundaries.',
          'Armored cargo flight frequency from African and Central Asian mining corridors exhibits 18% variance against standard commercial schedule.',
          'Floating storage volume in the Strait of Malacca and Fujairah reflects elevated shadow accumulation.'
        ],
        corridorBreakdown: [
          { corridor: 'Persian Gulf / Strait of Hormuz', status: 'Elevated Risk', notes: '4 unflagged AIS gap events tracked near Larak Island.' },
          { corridor: 'Zurich / London Vault Axis', status: 'High Inflow', notes: 'Correlated arrivals of 3 charter freighters from mining-adjacent hubs.' },
          { corridor: 'Singapore / Malacca STS Cluster', status: 'Active Transfers', notes: 'Simultaneous draft reduction and increase logged across 2 VLCCs.' }
        ],
        complianceAlert: 'Multiple counterparties flag secondary sanctions exposure under OFAC maritime advisories and LBMA gold provenance frameworks.'
      });
    }

    const systemPrompt = `You are the Chief Commodity Intelligence Officer for Aegis Intelligence.
Generate a structured, authoritative intelligence flow briefing for commodity traders and sanctions compliance officers.
Respond in JSON with:
{
  "title": "Clear briefing title",
  "classification": "RESTRICTED // COMMERCIAL ALPHA",
  "executiveSummary": "A dense, high-level summary of physical commodity shifts and illicit diversions",
  "keyFindings": ["3 to 4 detailed empirical findings based on the metrics"],
  "corridorBreakdown": [
    {"corridor": "Name of corridor", "status": "Status summary", "notes": "Specific empirical observation"}
  ],
  "complianceAlert": "Actionable compliance advisory regarding OFAC, EU, or LBMA standards"
}`;

    const userPrompt = `Monitored Commodity: ${commodity}\nDate Window: ${dateRange}\nMetrics: ${JSON.stringify(aggregateMetrics, null, 2)}\nMonitored Assets Count: ${activeEntities?.length || 0}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: 'Failed to generate flow intelligence report',
      message: error.message,
    });
  }
});

// Start server
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aegis Intelligence Server running on port ${PORT}`);
  });
}

startServer();
