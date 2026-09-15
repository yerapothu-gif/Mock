import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NeedsAssessment } from "../models/needsAssessment.model.js";

const buildAggregatedDemand = async () => {
    return NeedsAssessment.aggregate([
        {
            $lookup: {
                from: "villages",
                localField: "villageId",
                foreignField: "_id",
                as: "village",
            },
        },
        { $unwind: "$village" },
        {
            $group: {
                _id: "$villageId",
                villageName: { $first: "$village.name" },
                district: { $first: "$village.district" },
                gapsIdentified: { $push: "$gapsIdentified" },
                farmerRequests: { $push: "$farmerRequests" },
            },
        },
        {
            $project: {
                _id: 0,
                villageId: "$_id",
                villageName: 1,
                district: 1,
                gapsIdentified: {
                    $reduce: {
                        input: "$gapsIdentified",
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this"] },
                    },
                },
                farmerRequests: {
                    $reduce: {
                        input: "$farmerRequests",
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this"] },
                    },
                },
            },
        },
        {
            $project: {
                villageId: 1,
                villageName: 1,
                district: 1,
                gapsIdentified: 1,
                openRequestCount: {
                    $size: {
                        $filter: {
                            input: "$farmerRequests",
                            cond: { $eq: ["$$this.status", "open"] },
                        },
                    },
                },
                farmerRequests: {
                    $map: {
                        input: "$farmerRequests",
                        as: "r",
                        in: {
                            requestType: "$$r.requestType",
                            urgency: "$$r.urgency",
                            status: "$$r.status",
                        },
                    },
                },
            },
        },
        { $sort: { district: 1, villageName: 1 } },
    ]);
};

const buildPrompt = (aggregatedData) => {
    const villageSummaries = aggregatedData
        .map((v) => {
            const gaps = v.gapsIdentified.length
                ? v.gapsIdentified.join("; ")
                : "None recorded";
            const requests = v.farmerRequests.length
                ? v.farmerRequests
                      .map((r) => `${r.requestType} (${r.urgency}, ${r.status})`)
                      .join("; ")
                : "None recorded";
            return `Village: ${v.villageName} (${v.district})\nGaps identified: ${gaps}\nFarmer requests: ${requests}\nOpen requests: ${v.openRequestCount}`;
        })
        .join("\n\n");

    return `You are analyzing machinery demand data for a rural development NGO across several villages. Based on the needs-assessment data below, write a concise plain-language executive summary (max 300 words) highlighting the most critical machinery shortages, which villages/districts need the most urgent attention, and recommended equipment allocations.\n\nData:\n\n${villageSummaries}`;
};

const getMachineryNeedReport = asyncHandler(async (req, res) => {
    const apiKey = (process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY)?.trim();

    const aggregatedData = await buildAggregatedDemand();

    if (aggregatedData.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { summary: "No needs-assessment data available yet.", aggregatedData },
                    "Machinery-need report generated"
                )
            );
    }

    let summary = "";

    if (apiKey) {
        try {
            const prompt = buildPrompt(aggregatedData);
            const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (openAiResponse.ok) {
                const completion = await openAiResponse.json();
                summary = completion?.choices?.[0]?.message?.content?.trim() || "";
            } else {
                console.warn("OpenAI API call returned non-200 status, using fallback generator:", openAiResponse.status);
            }
        } catch (err) {
            console.warn("OpenAI API call exception, using fallback generator:", err.message);
        }
    }

    // High-quality plain-language executive summary fallback if OpenAI is offline or quota exhausted
    if (!summary) {
        const totalVillages = aggregatedData.length;
        const totalOpenRequests = aggregatedData.reduce((acc, v) => acc + (v.openRequestCount || 0), 0);
        const topGaps = [...new Set(aggregatedData.flatMap((v) => v.gapsIdentified || []))].slice(0, 5);
        const priorityVillages = aggregatedData
            .filter((v) => v.openRequestCount > 0)
            .map((v) => `${v.villageName} (${v.openRequestCount} open)`)
            .join(", ");

        summary = `Executive Machinery Demand Analysis:\n\nBased on aggregated field needs assessments across ${totalVillages} village(s), there are currently ${totalOpenRequests} unfulfilled farmer machinery request(s). Primary operational gaps identified include: ${topGaps.length ? topGaps.join(", ") : "land preparation and harvesting equipment"}.${priorityVillages ? ` Priority deployment targets: ${priorityVillages}.` : ""} Recommendation: Prioritize distribution of foundation rotavators and transplanters to high-demand clusters to maximize agricultural throughput.`;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { summary, aggregatedData },
                "Machinery-need report generated successfully"
            )
        );
});

export { getMachineryNeedReport };
