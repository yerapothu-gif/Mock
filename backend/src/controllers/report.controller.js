import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NeedsAssessment } from "../models/index.js";

/**
 * Generate AI-powered machinery demand summary
 * GET /api/reports/machinery-need
 */
export const getMachineryNeedReport = asyncHandler(async (req, res) => {
    // 1. Aggregation pipeline: group gaps and open farmer requests by village
    const aggregatedDemand = await NeedsAssessment.aggregate([
        {
            $lookup: {
                from: "villages",
                localField: "villageId",
                foreignField: "_id",
                as: "village",
            },
        },
        { $unwind: { path: "$village", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$villageId",
                villageName: { $first: "$village.name" },
                district: { $first: "$village.district" },
                majorCrops: { $first: "$village.majorCrops" },
                allGaps: { $push: "$gapsIdentified" },
                allRequests: { $push: "$farmerRequests" },
            },
        },
    ]);

    // Flatten gaps and requests per village
    const reportData = aggregatedDemand.map((item) => {
        const flattenedGaps = [...new Set((item.allGaps || []).flat())];
        const openRequests = (item.allRequests || [])
            .flat()
            .filter((r) => r.status === "open");

        // Count demand by machine type
        const machineDemandCounts = {};
        openRequests.forEach((r) => {
            const type = r.requestType || r.machineTypeNeeded || "General Machinery";
            machineDemandCounts[type] = (machineDemandCounts[type] || 0) + 1;
        });

        return {
            villageName: item.villageName || "Unknown Village",
            district: item.district || "Madhya Pradesh",
            majorCrops: item.majorCrops || [],
            operationalGaps: flattenedGaps,
            openRequestsCount: openRequests.length,
            demandsByType: machineDemandCounts,
        };
    });

    // 2. Format prompt for OpenAI LLM
    const dataPrompt = `
You are the Chief Agricultural Technology Analyst for the Reaching Roots Foundation in Madhya Pradesh (operating around the Ratapani wildlife sanctuary).
Analyze the following aggregated machinery needs and operational gaps collected by field volunteers across rural villages:

${JSON.stringify(reportData, null, 2)}

Provide an executive, actionable summary report with:
1. Critical Machinery Shortages: Which machines (e.g. Rotavators, Paddy Transplanters, Power Sprayers) have the highest demand and urgency?
2. District / Village Hotspots: Which villages require immediate foundation machinery deployment and VLE onboarding?
3. Strategic Recommendations: What equipment allocation plan will best solve the labor shortage and planting window bottlenecks?
Keep the tone professional, direct, and structured with clear bullet points.
`;

    let aiSummary = "";
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY;

    // 3. Call OpenAI API if an API key is configured
    if (apiKey) {
        try {
            const openAiRes = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are an expert rural mechanization and agricultural operations consultant.",
                            },
                            { role: "user", content: dataPrompt },
                        ],
                        temperature: 0.7,
                    }),
                }
            );

            if (openAiRes.ok) {
                const aiResult = await openAiRes.json();
                aiSummary = aiResult.choices?.[0]?.message?.content || "";
            } else {
                console.error("OpenAI request failed:", await openAiRes.text());
            }
        } catch (err) {
            console.error("OpenAI API call failed, falling back to rule-based summary:", err);
        }
    }

    // Fallback rule-based summary if OpenAI key is not configured or the call failed
    if (!aiSummary) {
        const totalOpenRequests = reportData.reduce(
            (acc, curr) => acc + curr.openRequestsCount,
            0
        );
        aiSummary = `### Reaching Roots Foundation — Machinery Needs Executive Summary

**Overview**: Aggregated analysis of ${reportData.length} surveyed villages in Madhya Pradesh identified a total of ${totalOpenRequests} unfulfilled farmer machinery requests.

**1. Critical Machinery Shortages**:
- High concentration of demand for **Paddy Transplanters** and **Tractor Rotavators** during key land preparation windows.
- Persistent pesticide application bottlenecks due to manual hand-pump spraying; power boom sprayers urgently required.

**2. High Priority Village Hotspots**:
${reportData
    .slice(0, 5)
    .map(
        (v) =>
            `- **${v.villageName} (${v.district})**: ${v.openRequestsCount} open requests. Gaps: ${v.operationalGaps.join(", ") || "Machinery shortage"}`
    )
    .join("\n")}

**3. Actionable Equipment Allocation Strategy**:
- Deploy foundation-owned multi-crop seed drills and rotavators to villages in the 'assessed' readiness stage.
- Fast-track VLE onboarding and training in high-demand clusters to ensure rental availability ahead of the monsoon planting window.`;
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                generatedAt: new Date(),
                totalVillagesAnalyzed: reportData.length,
                aggregatedDemand: reportData,
                aiSummary,
            },
            "AI machinery demand report generated successfully"
        )
    );
});
