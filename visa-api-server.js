// ============================================================
//  Musafir AI Visa Chatbot — API Server
//  Model  : Gemini 2.0 Flash (free tier)
//  Deploy : Render.com (free)
// ============================================================

const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── GEMINI CONFIG ────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── FULL DATASET (all collections embedded) ──────────────────

const VISA_SKU = [
  {
    _id: "AE_TOUR_30D_SGL_STD_001", skuCode: "AE_TOUR_30D_SGL_STD_001",
    countryCode: "AE", countryName: "United Arab Emirates",
    purpose: "tourist", travelerType: "adult", entryType: "single",
    validityDays: 30, stayDays: 30, processingMode: "evisa",
    processingSpeed: "standard", processingTimeDays: 3, minLeadTimeDays: 2,
    basePrice: { currency: "AED", amount: 299 },
    ctaUrl: "/visa/ae-tourist-single-standard", isActive: true
  },
  {
    _id: "AE_TOUR_30D_SGL_EXP_001", skuCode: "AE_TOUR_30D_SGL_EXP_001",
    countryCode: "AE", countryName: "United Arab Emirates",
    purpose: "tourist", travelerType: "adult", entryType: "single",
    validityDays: 30, stayDays: 30, processingMode: "evisa",
    processingSpeed: "express", processingTimeDays: 1, minLeadTimeDays: 1,
    basePrice: { currency: "AED", amount: 339 },
    ctaUrl: "/visa/ae-tourist-single-express", isActive: true
  },
  {
    _id: "AE_STUD_90D_SGL_STD_001", skuCode: "AE_STUD_90D_SGL_STD_001",
    countryCode: "AE", countryName: "United Arab Emirates",
    purpose: "student", travelerType: "adult", entryType: "single",
    validityDays: 180, stayDays: 90, processingMode: "evisa",
    processingSpeed: "standard", processingTimeDays: 5, minLeadTimeDays: 7,
    basePrice: { currency: "AED", amount: 499 },
    ctaUrl: "/visa/ae-student-standard", isActive: true
  },
  {
    _id: "AE_STUD_90D_SGL_EXP_001", skuCode: "AE_STUD_90D_SGL_EXP_001",
    countryCode: "AE", countryName: "United Arab Emirates",
    purpose: "student", travelerType: "adult", entryType: "single",
    validityDays: 180, stayDays: 90, processingMode: "evisa",
    processingSpeed: "express", processingTimeDays: 3, minLeadTimeDays: 5,
    basePrice: { currency: "AED", amount: 549 },
    ctaUrl: "/visa/ae-student-express", isActive: true
  },
  {
    _id: "SA_TOUR_30D_SGL_STD_001", skuCode: "SA_TOUR_30D_SGL_STD_001",
    countryCode: "SA", countryName: "Saudi Arabia",
    purpose: "tourist", travelerType: "adult", entryType: "single",
    validityDays: 30, stayDays: 30, processingMode: "evisa",
    processingSpeed: "standard", processingTimeDays: 3, minLeadTimeDays: 2,
    basePrice: { currency: "AED", amount: 309 },
    ctaUrl: "/visa/sa-tourist-single-standard", isActive: true
  },
  {
    _id: "SA_TOUR_30D_SGL_EXP_001", skuCode: "SA_TOUR_30D_SGL_EXP_001",
    countryCode: "SA", countryName: "Saudi Arabia",
    purpose: "tourist", travelerType: "adult", entryType: "single",
    validityDays: 30, stayDays: 30, processingMode: "evisa",
    processingSpeed: "express", processingTimeDays: 1, minLeadTimeDays: 1,
    basePrice: { currency: "AED", amount: 349 },
    ctaUrl: "/visa/sa-tourist-single-express", isActive: true
  },
  {
    _id: "SA_STUD_90D_SGL_STD_001", skuCode: "SA_STUD_90D_SGL_STD_001",
    countryCode: "SA", countryName: "Saudi Arabia",
    purpose: "student", travelerType: "adult", entryType: "single",
    validityDays: 180, stayDays: 90, processingMode: "evisa",
    processingSpeed: "standard", processingTimeDays: 6, minLeadTimeDays: 7,
    basePrice: { currency: "AED", amount: 514 },
    ctaUrl: "/visa/sa-student-standard", isActive: true
  },
  {
    _id: "SA_STUD_90D_SGL_EXP_001", skuCode: "SA_STUD_90D_SGL_EXP_001",
    countryCode: "SA", countryName: "Saudi Arabia",
    purpose: "student", travelerType: "adult", entryType: "single",
    validityDays: 180, stayDays: 90, processingMode: "evisa",
    processingSpeed: "express", processingTimeDays: 4, minLeadTimeDays: 5,
    basePrice: { currency: "AED", amount: 564 },
    ctaUrl: "/visa/sa-student-express", isActive: true
  },
  {
    _id: "TR_TOUR_30D_SGL_STD_001", skuCode: "TR_TOUR_30D_SGL_STD_001",
    countryCode: "TR", countryName: "Turkey",
    purpose: "tourist", travelerType: "adult", entryType: "single",
    validityDays: 30, stayDays: 30, processingMode: "evisa",
    processingSpeed: "standard", processingTimeDays: 4, minLeadTimeDays: 2,
    basePrice: { currency: "AED", amount: 319 },
    ctaUrl: "/visa/tr-tourist-single-standard", isActive: true
  },
  {
    _id: "TR_TOUR_30D_SGL_EXP_001", skuCode: "TR_TOUR_30D_SGL_EXP_001",
    countryCode: "TR", countryName: "Turkey",
    purpose: "tourist", travelerType: "adult", entryType: "single",
    validityDays: 30, stayDays: 30, processingMode: "evisa",
    processingSpeed: "express", processingTimeDays: 2, minLeadTimeDays: 1,
    basePrice: { currency: "AED", amount: 359 },
    ctaUrl: "/visa/tr-tourist-single-express", isActive: true
  },
  {
    _id: "TR_STUD_90D_SGL_STD_001", skuCode: "TR_STUD_90D_SGL_STD_001",
    countryCode: "TR", countryName: "Turkey",
    purpose: "student", travelerType: "adult", entryType: "single",
    validityDays: 180, stayDays: 90, processingMode: "evisa",
    processingSpeed: "standard", processingTimeDays: 6, minLeadTimeDays: 7,
    basePrice: { currency: "AED", amount: 524 },
    ctaUrl: "/visa/tr-student-standard", isActive: true
  },
  {
    _id: "TR_STUD_90D_SGL_EXP_001", skuCode: "TR_STUD_90D_SGL_EXP_001",
    countryCode: "TR", countryName: "Turkey",
    purpose: "student", travelerType: "adult", entryType: "single",
    validityDays: 180, stayDays: 90, processingMode: "evisa",
    processingSpeed: "express", processingTimeDays: 4, minLeadTimeDays: 5,
    basePrice: { currency: "AED", amount: 574 },
    ctaUrl: "/visa/tr-student-express", isActive: true
  }
];

// All 15 destinations — used for travel recommendations
const DESTINATION = [
  { _id:"DEST_AE", destinationCountryCode:"AE", destinationCountryName:"United Arab Emirates", interests:["city","beach","shopping"],   popularityScore:0.92, minProcessingDays:2,  startingPrice:{currency:"AED",amount:250}, hasSkusInPoc:true  },
  { _id:"DEST_SA", destinationCountryCode:"SA", destinationCountryName:"Saudi Arabia",          interests:["historical","city","nature"], popularityScore:0.76, minProcessingDays:3,  startingPrice:{currency:"AED",amount:320}, hasSkusInPoc:true  },
  { _id:"DEST_TR", destinationCountryCode:"TR", destinationCountryName:"Turkey",                interests:["historical","city","beach"],  popularityScore:0.88, minProcessingDays:4,  startingPrice:{currency:"AED",amount:340}, hasSkusInPoc:true  },
  { _id:"DEST_GE", destinationCountryCode:"GE", destinationCountryName:"Georgia",               interests:["nature","city"],             popularityScore:0.79, minProcessingDays:5,  startingPrice:{currency:"AED",amount:180}, hasSkusInPoc:false },
  { _id:"DEST_AZ", destinationCountryCode:"AZ", destinationCountryName:"Azerbaijan",            interests:["city","nightlife"],          popularityScore:0.74, minProcessingDays:5,  startingPrice:{currency:"AED",amount:200}, hasSkusInPoc:false },
  { _id:"DEST_TH", destinationCountryCode:"TH", destinationCountryName:"Thailand",              interests:["beach","nightlife"],         popularityScore:0.90, minProcessingDays:6,  startingPrice:{currency:"AED",amount:260}, hasSkusInPoc:false },
  { _id:"DEST_SG", destinationCountryCode:"SG", destinationCountryName:"Singapore",             interests:["city","shopping"],           popularityScore:0.81, minProcessingDays:7,  startingPrice:{currency:"AED",amount:420}, hasSkusInPoc:false },
  { _id:"DEST_ID", destinationCountryCode:"ID", destinationCountryName:"Indonesia",             interests:["beach","nature"],            popularityScore:0.84, minProcessingDays:6,  startingPrice:{currency:"AED",amount:240}, hasSkusInPoc:false },
  { _id:"DEST_MY", destinationCountryCode:"MY", destinationCountryName:"Malaysia",              interests:["city","nature"],             popularityScore:0.77, minProcessingDays:6,  startingPrice:{currency:"AED",amount:230}, hasSkusInPoc:false },
  { _id:"DEST_LK", destinationCountryCode:"LK", destinationCountryName:"Sri Lanka",             interests:["beach","nature"],            popularityScore:0.68, minProcessingDays:7,  startingPrice:{currency:"AED",amount:170}, hasSkusInPoc:false },
  { _id:"DEST_MV", destinationCountryCode:"MV", destinationCountryName:"Maldives",              interests:["beach","luxury"],            popularityScore:0.73, minProcessingDays:7,  startingPrice:{currency:"AED",amount:520}, hasSkusInPoc:false },
  { _id:"DEST_JP", destinationCountryCode:"JP", destinationCountryName:"Japan",                 interests:["city","historical"],         popularityScore:0.86, minProcessingDays:10, startingPrice:{currency:"AED",amount:650}, hasSkusInPoc:false },
  { _id:"DEST_KR", destinationCountryCode:"KR", destinationCountryName:"South Korea",           interests:["city","historical"],         popularityScore:0.80, minProcessingDays:9,  startingPrice:{currency:"AED",amount:600}, hasSkusInPoc:false },
  { _id:"DEST_IT", destinationCountryCode:"IT", destinationCountryName:"Italy",                 interests:["historical","city"],         popularityScore:0.78, minProcessingDays:12, startingPrice:{currency:"AED",amount:700}, hasSkusInPoc:false },
  { _id:"DEST_ES", destinationCountryCode:"ES", destinationCountryName:"Spain",                 interests:["beach","historical"],        popularityScore:0.75, minProcessingDays:12, startingPrice:{currency:"AED",amount:680}, hasSkusInPoc:false }
];

const DESTINATION_MARKET = [
  {
    _id: "CFG_AE_MUSAFIR_IN_v1",
    destinationCountryCode: "AE", market: "MUSAFIR_IN", version: 1, status: "active",
    minimumDocuments: [
      { docCode: "passport_copy",    mandatory: true,  notes: "Must be valid 6+ months" },
      { docCode: "photograph",       mandatory: true,  notes: "White background" },
      { docCode: "flight_itinerary", mandatory: true,  notes: "Confirmed booking" },
      { docCode: "hotel_booking",    mandatory: true,  notes: "Required unless staying with family" }
    ],
    visaModeRules: [
      {
        ruleId: "AE_VMR_001", priority: 30,
        ruleName: "Schengen holders can use evisa",
        conditions: { nationalityIn: ["IN","PH","PK"], residencyCountryIn: ["AE","SA","QA","KW","BH","OM"], hasVisaOrPermitIn: ["SCHENGEN"] },
        visaMode: "evisa",
        applicableSkuCodes: ["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001"]
      },
      {
        ruleId: "AE_VMR_002", priority: 100,
        ruleName: "Nigeria passport not applicable for tourist evisa",
        conditions: { nationalityIn: ["NG"] },
        visaMode: "not_applicable",
        applicableSkuCodes: ["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001"]
      }
    ],
    documentRules: [
      {
        ruleId: "AE_DR_001", priority: 50,
        ruleName: "Indian travelers require bank statement",
        conditions: { nationalityIn: ["IN"] },
        additionalDocuments: [{ docCode: "bank_statement", mandatory: true, notes: "Last 3 months" }],
        applicableSkuCodes: ["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]
      },
      {
        ruleId: "AE_DR_002", priority: 60,
        ruleName: "GCC residents do not need bank statement",
        conditions: { nationalityIn: ["IN"], residencyCountryIn: ["AE","SA","QA","KW","BH","OM"] },
        removeDocuments: ["bank_statement"],
        applicableSkuCodes: ["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]
      },
      {
        ruleId: "AE_DR_003", priority: 70,
        ruleName: "If staying with family hotel booking becomes optional",
        conditions: { stayingWithFamily: true },
        setMandatory: [{ docCode: "hotel_booking", mandatory: false, notes: "Not needed if staying with family" }],
        applicableSkuCodes: ["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]
      }
    ],
    pricingAdjustments: [
      {
        ruleId: "AE_PA_001", priority: 40,
        ruleName: "GCC residency surcharge",
        conditions: { residencyCountryIn: ["AE","SA","QA","KW","BH","OM"] },
        adjustment: { type: "add_amount", currency: "AED", value: 17 },
        applicableSkuCodes: ["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]
      }
    ]
  },
  {
    _id: "CFG_SA_MUSAFIR_IN_v1",
    destinationCountryCode: "SA", market: "MUSAFIR_IN", version: 1, status: "active",
    minimumDocuments: [
      { docCode: "passport_copy", mandatory: true,  notes: "Must be valid 6+ months" },
      { docCode: "photograph",    mandatory: true,  notes: "White background" },
      { docCode: "hotel_booking", mandatory: true,  notes: "Required unless staying with family" }
    ],
    visaModeRules: [
      {
        ruleId: "SA_VMR_001", priority: 50,
        ruleName: "GCC residents eligible for evisa",
        conditions: { residencyCountryIn: ["AE","SA","QA","KW","BH","OM"] },
        visaMode: "evisa",
        applicableSkuCodes: ["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001"]
      }
    ],
    documentRules: [
      {
        ruleId: "SA_DR_001", priority: 40,
        ruleName: "Pakistan travelers require invitation letter",
        conditions: { nationalityIn: ["PK"] },
        additionalDocuments: [{ docCode: "invitation_letter", mandatory: true, notes: "From host or sponsor" }],
        applicableSkuCodes: ["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001","SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]
      },
      {
        ruleId: "SA_DR_002", priority: 80,
        ruleName: "Student purpose requires university admission letter",
        conditions: {},
        additionalDocuments: [{ docCode: "university_admission_letter", mandatory: true, notes: "Issued by the university" }],
        applicableSkuCodes: ["SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]
      },
      {
        ruleId: "SA_DR_003", priority: 90,
        ruleName: "Canary document rule for evaluation",
        conditions: { nationalityIn: ["PH"], residencyCountryIn: ["IN"] },
        additionalDocuments: [{ docCode: "employment_letter_v2", mandatory: true, notes: "Specific format required" }],
        applicableSkuCodes: ["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001"]
      }
    ],
    pricingAdjustments: [
      {
        ruleId: "SA_PA_001", priority: 30,
        ruleName: "Family travel group package fee",
        conditions: { travelGroupIn: ["family"] },
        adjustment: { type: "add_amount", currency: "AED", value: 25 },
        applicableSkuCodes: ["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001","SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]
      }
    ]
  },
  {
    _id: "CFG_TR_MUSAFIR_IN_v1",
    destinationCountryCode: "TR", market: "MUSAFIR_IN", version: 1, status: "active",
    minimumDocuments: [
      { docCode: "passport_copy",   mandatory: true, notes: "Must be valid 6+ months" },
      { docCode: "photograph",      mandatory: true, notes: "White background" },
      { docCode: "bank_statement",  mandatory: true, notes: "Last 6 months" },
      { docCode: "travel_insurance",mandatory: true, notes: "Coverage required" }
    ],
    visaModeRules: [
      {
        ruleId: "TR_VMR_001", priority: 60,
        ruleName: "Schengen holders can use evisa for tourist",
        conditions: { hasVisaOrPermitIn: ["SCHENGEN"] },
        visaMode: "evisa",
        applicableSkuCodes: ["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001"]
      }
    ],
    documentRules: [
      {
        ruleId: "TR_DR_001", priority: 70,
        ruleName: "If residency is UAE bank statement reduces to 3 months",
        conditions: { residencyCountryIn: ["AE"] },
        modifyDocuments: [{ docCode: "bank_statement", notes: "Last 3 months" }],
        applicableSkuCodes: ["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001","TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]
      },
      {
        ruleId: "TR_DR_002", priority: 80,
        ruleName: "Student purpose requires education certificate",
        conditions: {},
        additionalDocuments: [{ docCode: "education_certificate", mandatory: true, notes: "Highest qualification" }],
        applicableSkuCodes: ["TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]
      }
    ],
    pricingAdjustments: [
      {
        ruleId: "TR_PA_001", priority: 50,
        ruleName: "Discount for UAE residents",
        conditions: { residencyCountryIn: ["AE"] },
        adjustment: { type: "subtract_amount", currency: "AED", value: 13 },
        applicableSkuCodes: ["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001","TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]
      }
    ]
  }
];

const KNOWLEDGE_SOURCES = [
  { _id:"SRC_AE_001", destinationCountryCode:"AE", sourceType:"government", title:"AE visa snapshot", chunkId:"AE_CH_001", text:"Baseline docs include passport copy and photograph. Some cases require bank statement.", trustScore:0.9 },
  { _id:"SRC_SA_001", destinationCountryCode:"SA", sourceType:"government", title:"SA visa snapshot", chunkId:"SA_CH_001", text:"Tourist evisa available for eligible residents. Document rules vary by traveler profile.", trustScore:0.9 },
  { _id:"SRC_TR_001", destinationCountryCode:"TR", sourceType:"government", title:"TR visa snapshot", chunkId:"TR_CH_001", text:"Travel insurance and bank statement are common requirements. Schengen holders may use evisa for tourist.", trustScore:0.9 }
];

// ── SYSTEM PROMPT ────────────────────────────────────────────

function buildSystemPrompt() {
  return `You are an AI-powered visa sourcing assistant for Musafir (market: MUSAFIR_IN).
You answer visa-related questions STRICTLY using the dataset below.
You NEVER invent data. You NEVER use outside knowledge about visa rules.
You return ONLY a valid JSON object — no markdown, no explanation, no backticks.

═══════════════════════════
DATASET
═══════════════════════════

### visasku (visa products — only AE, SA, TR have products in this POC)
${JSON.stringify(VISA_SKU)}

### destination (all 15 countries — use for travel recommendations)
${JSON.stringify(DESTINATION)}

### destinationmarket (eligibility rules, document rules, pricing rules — MUSAFIR_IN market only)
${JSON.stringify(DESTINATION_MARKET)}

### knowledgesources (supplementary notes — destinationmarket rules take precedence)
${JSON.stringify(KNOWLEDGE_SOURCES)}

═══════════════════════════
PROCESSING PIPELINE — follow this exactly for every request
═══════════════════════════

STEP 1 — Parse user context
Extract: nationality, residencyCountry, hasVisaOrPermit, travelPurpose, travelGroup, stayingWithFamily, destinationCountry.

STEP 2 — Match SKUs
Filter visasku where countryCode = destinationCountry AND isActive = true AND purpose matches travelPurpose (if provided).

STEP 3 — Apply visaModeRules (descending priority, FIRST matching rule wins)
• Check each rule's conditions against user context.
• Condition fields: nationalityIn, residencyCountryIn, hasVisaOrPermitIn, travelGroupIn, stayingWithFamily.
• A rule matches only if ALL its conditions are satisfied.
• An empty conditions object {} always matches.
• If matched visaMode = "not_applicable" → traveler is NOT eligible for those SKUs.
• If no rule matches → traveler is eligible by default (all SKUs are evisa).

STEP 4 — Compute documents (apply ALL matching documentRules cumulatively, descending priority)
Start with minimumDocuments array from the market config.
Then for each matching documentRule (ALL that match, not just first):
  - additionalDocuments → add each to the list (if not already present)
  - removeDocuments → remove those docCodes from the list
  - setMandatory → update the mandatory flag of that docCode
  - modifyDocuments → update the notes of that docCode
Final list = authoritative required documents.

STEP 5 — Compute final price for each eligible SKU
Start with basePrice.amount. Apply ALL matching pricingAdjustments:
  - add_amount → add value
  - subtract_amount → subtract value

STEP 6 — Travel recommendations (when asked)
Filter destination collection by matching interests. Rank by popularityScore descending.
For hasSkusInPoc=false destinations: recommend them but note visa booking is not available in current system.
For hasSkusInPoc=true: include the visa options.

═══════════════════════════
RESPONSE FORMAT — return EXACTLY this JSON shape, nothing else
═══════════════════════════

{
  "answer": "Friendly human-readable answer summarising eligibility, documents, price, processing time.",
  "references": [
    { "collection": "visasku | destinationmarket | destination | knowledgesources", "id": "record _id or skuCode or ruleId", "field": "optional field name" }
  ],
  "eligibility": "eligible | not_eligible | unknown",
  "recommendedSkus": [
    { "skuCode": "...", "processingSpeed": "standard | express", "processingTimeDays": 0, "finalPrice": { "currency": "AED", "amount": 0 }, "ctaUrl": "..." }
  ],
  "requiredDocuments": [
    { "docCode": "...", "mandatory": true, "notes": "..." }
  ]
}

REFUSAL (use when query is not answerable from dataset):
{ "answer": "I can only answer questions based on the available visa dataset. This query is outside the scope of the current dataset.", "references": [], "eligibility": "unknown", "recommendedSkus": [], "requiredDocuments": [] }

═══════════════════════════
HARD RULES — never violate
═══════════════════════════
1. Return ONLY the JSON object. No markdown fences, no preamble, no explanation.
2. NEVER invent visa rules, prices, documents, or processing times not in the dataset.
3. NEVER include SKUs where isActive = false.
4. Apply ALL matching document rules — never skip one.
5. Include ruleIds in references for every rule you applied.
6. For destinations with hasSkusInPoc=false, do NOT invent SKUs — acknowledge in answer that visa booking details are not in the current system.
7. If user context is ambiguous, state your assumption in the answer field.
`;
}

// ── GEMINI API CALL ──────────────────────────────────────────

async function callGemini(question, userContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable not set");

  const payload = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt() }]
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `User question: ${question}\n\nUser context: ${JSON.stringify(userContext, null, 2)}\n\nRespond with ONLY a valid JSON object.`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,          // deterministic — critical for rule-based accuracy
      maxOutputTokens: 1500,
      responseMimeType: "application/json"  // tells Gemini to output pure JSON
    }
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  // Extract text from Gemini response structure
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini");

  // Clean and parse JSON (strip any accidental markdown fences)
  const clean = rawText.replace(/```json|```/gi, "").trim();
  const start = clean.indexOf("{");
  const end   = clean.lastIndexOf("}");
  if (start === -1) throw new Error("No JSON object found in Gemini response");

  return JSON.parse(clean.slice(start, end + 1));
}

// ── VALIDATE RESPONSE SHAPE ──────────────────────────────────
// Ensures the response always matches the contract even if model goes off-rail

function validateAndClean(result) {
  return {
    answer:           typeof result.answer === "string"    ? result.answer : "Response could not be generated.",
    references:       Array.isArray(result.references)     ? result.references : [],
    eligibility:      ["eligible","not_eligible","unknown"].includes(result.eligibility) ? result.eligibility : "unknown",
    recommendedSkus:  Array.isArray(result.recommendedSkus)  ? result.recommendedSkus : [],
    requiredDocuments:Array.isArray(result.requiredDocuments) ? result.requiredDocuments : []
  };
}

// ── SHARED HANDLER ───────────────────────────────────────────

async function handleChat(req, res) {
  const start = Date.now();

  try {
    const body = req.body;

    // Harness may send "message" or "question" — accept both
    const question = body.question || body.message || "";

    // Harness may send "userContext" or "context" — accept both
    const userContext = body.userContext || body.context || {};

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        answer: "Please provide a question.",
        references: [], eligibility: "unknown",
        recommendedSkus: [], requiredDocuments: []
      });
    }

    console.log(`[${new Date().toISOString()}] Q: "${question.slice(0,80)}" | ctx: ${JSON.stringify(userContext)}`);

    const result = await callGemini(question.trim(), userContext);
    const cleaned = validateAndClean(result);
    const latencyMs = Date.now() - start;

    console.log(`[${new Date().toISOString()}] Done in ${latencyMs}ms | eligibility: ${cleaned.eligibility}`);

    res.json({ ...cleaned, _meta: { latencyMs, model: GEMINI_MODEL } });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      answer: "An internal error occurred. Please try again.",
      references: [], eligibility: "unknown",
      recommendedSkus: [], requiredDocuments: [],
      _error: err.message
    });
  }
}

// ── ROUTES ───────────────────────────────────────────────────

// /vendor/chat — what the harness actually calls
app.post("/vendor/chat", handleChat);

// /chat — alias, useful for direct testing
app.post("/chat", handleChat);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    market: "MUSAFIR_IN",
    model: GEMINI_MODEL,
    destinations: DESTINATION.map(d => d.destinationCountryCode),
    skuCount: VISA_SKU.length,
    timestamp: new Date().toISOString()
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    name: "Musafir Visa Chatbot API",
    version: "1.0.0",
    endpoints: {
      "POST /vendor/chat": "Main endpoint (harness uses this)",
      "POST /chat":        "Alias for direct testing",
      "GET  /health":      "Health check"
    }
  });
});

// ── START ────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✈  Musafir Visa API running on port ${PORT}`);
  console.log(`   Model    : ${GEMINI_MODEL}`);
  console.log(`   Endpoint : POST /chat`);
  console.log(`   Health   : GET  /health`);
});
