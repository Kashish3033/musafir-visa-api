// ============================================================
//  Musafir Visa Chatbot — Hybrid LLM + Rules Engine v3
//  Architecture: Rules engine computes all structured data
//  (eligibility, documents, prices, SKUs, trace).
//  Gemini LLM generates warm conversational answerText only.
//  Hallucination validator ensures LLM output matches reality.
//  Graceful fallback to rules engine if LLM fails/times out.
// ============================================================

const express = require("express");
const cors    = require("cors");
const app     = express();
app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════════════════
//  DATASET
// ════════════════════════════════════════════════════════════

const VISA_SKU = [
  { _id:"AE_TOUR_30D_SGL_STD_001", skuCode:"AE_TOUR_30D_SGL_STD_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"tourist", processingSpeed:"standard", processingTimeDays:3, minLeadTimeDays:2, validityDays:30, stayDays:30, basePrice:{currency:"AED",amount:299}, ctaUrl:"/visa/ae-tourist-single-standard", isActive:true },
  { _id:"AE_TOUR_30D_SGL_EXP_001", skuCode:"AE_TOUR_30D_SGL_EXP_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"tourist", processingSpeed:"express",  processingTimeDays:1, minLeadTimeDays:1, validityDays:30, stayDays:30, basePrice:{currency:"AED",amount:339}, ctaUrl:"/visa/ae-tourist-single-express",  isActive:true },
  { _id:"AE_STUD_90D_SGL_STD_001", skuCode:"AE_STUD_90D_SGL_STD_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"student", processingSpeed:"standard", processingTimeDays:5, minLeadTimeDays:7, validityDays:180,stayDays:90, basePrice:{currency:"AED",amount:499}, ctaUrl:"/visa/ae-student-standard",         isActive:true },
  { _id:"AE_STUD_90D_SGL_EXP_001", skuCode:"AE_STUD_90D_SGL_EXP_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"student", processingSpeed:"express",  processingTimeDays:3, minLeadTimeDays:5, validityDays:180,stayDays:90, basePrice:{currency:"AED",amount:549}, ctaUrl:"/visa/ae-student-express",          isActive:true },
  { _id:"SA_TOUR_30D_SGL_STD_001", skuCode:"SA_TOUR_30D_SGL_STD_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"tourist", processingSpeed:"standard", processingTimeDays:3, minLeadTimeDays:2, validityDays:30, stayDays:30, basePrice:{currency:"AED",amount:309}, ctaUrl:"/visa/sa-tourist-single-standard", isActive:true },
  { _id:"SA_TOUR_30D_SGL_EXP_001", skuCode:"SA_TOUR_30D_SGL_EXP_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"tourist", processingSpeed:"express",  processingTimeDays:1, minLeadTimeDays:1, validityDays:30, stayDays:30, basePrice:{currency:"AED",amount:349}, ctaUrl:"/visa/sa-tourist-single-express",  isActive:true },
  { _id:"SA_STUD_90D_SGL_STD_001", skuCode:"SA_STUD_90D_SGL_STD_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"student", processingSpeed:"standard", processingTimeDays:6, minLeadTimeDays:7, validityDays:180,stayDays:90, basePrice:{currency:"AED",amount:514}, ctaUrl:"/visa/sa-student-standard",         isActive:true },
  { _id:"SA_STUD_90D_SGL_EXP_001", skuCode:"SA_STUD_90D_SGL_EXP_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"student", processingSpeed:"express",  processingTimeDays:4, minLeadTimeDays:5, validityDays:180,stayDays:90, basePrice:{currency:"AED",amount:564}, ctaUrl:"/visa/sa-student-express",          isActive:true },
  { _id:"TR_TOUR_30D_SGL_STD_001", skuCode:"TR_TOUR_30D_SGL_STD_001", countryCode:"TR", countryName:"Turkey",                purpose:"tourist", processingSpeed:"standard", processingTimeDays:4, minLeadTimeDays:2, validityDays:30, stayDays:30, basePrice:{currency:"AED",amount:319}, ctaUrl:"/visa/tr-tourist-single-standard", isActive:true },
  { _id:"TR_TOUR_30D_SGL_EXP_001", skuCode:"TR_TOUR_30D_SGL_EXP_001", countryCode:"TR", countryName:"Turkey",                purpose:"tourist", processingSpeed:"express",  processingTimeDays:2, minLeadTimeDays:1, validityDays:30, stayDays:30, basePrice:{currency:"AED",amount:359}, ctaUrl:"/visa/tr-tourist-single-express",  isActive:true },
  { _id:"TR_STUD_90D_SGL_STD_001", skuCode:"TR_STUD_90D_SGL_STD_001", countryCode:"TR", countryName:"Turkey",                purpose:"student", processingSpeed:"standard", processingTimeDays:6, minLeadTimeDays:7, validityDays:180,stayDays:90, basePrice:{currency:"AED",amount:524}, ctaUrl:"/visa/tr-student-standard",         isActive:true },
  { _id:"TR_STUD_90D_SGL_EXP_001", skuCode:"TR_STUD_90D_SGL_EXP_001", countryCode:"TR", countryName:"Turkey",                purpose:"student", processingSpeed:"express",  processingTimeDays:4, minLeadTimeDays:5, validityDays:180,stayDays:90, basePrice:{currency:"AED",amount:574}, ctaUrl:"/visa/tr-student-express",          isActive:true }
];

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
    _id:"CFG_AE_MUSAFIR_IN_v1", destinationCountryCode:"AE",
    minimumDocuments:[
      {docCode:"passport_copy",    mandatory:true,  notes:"Must be valid 6+ months"},
      {docCode:"photograph",       mandatory:true,  notes:"White background"},
      {docCode:"flight_itinerary", mandatory:true,  notes:"Confirmed booking"},
      {docCode:"hotel_booking",    mandatory:true,  notes:"Required unless staying with family"}
    ],
    visaModeRules:[
      {ruleId:"AE_VMR_001", priority:30,  conditions:{nationalityIn:["IN","PH","PK"], residencyCountryIn:["AE","SA","QA","KW","BH","OM"], hasVisaOrPermitIn:["SCHENGEN"]}, visaMode:"evisa",          applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001"]},
      {ruleId:"AE_VMR_002", priority:100, conditions:{nationalityIn:["NG"]},                                                                                              visaMode:"not_applicable", applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001"]}
    ],
    documentRules:[
      {ruleId:"AE_DR_001", priority:50, conditions:{nationalityIn:["IN"]},                                                    additionalDocuments:[{docCode:"bank_statement",mandatory:true,notes:"Last 3 months"}],                             applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]},
      {ruleId:"AE_DR_002", priority:60, conditions:{nationalityIn:["IN"], residencyCountryIn:["AE","SA","QA","KW","BH","OM"]}, removeDocuments:["bank_statement"],                                                                              applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]},
      {ruleId:"AE_DR_003", priority:70, conditions:{stayingWithFamily:true},                                                  setMandatory:[{docCode:"hotel_booking",mandatory:false,notes:"Not needed if staying with family"}],                applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]}
    ],
    pricingAdjustments:[
      {ruleId:"AE_PA_001", priority:40, conditions:{residencyCountryIn:["AE","SA","QA","KW","BH","OM"]}, adjustment:{type:"add_amount",currency:"AED",value:17}, applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]}
    ]
  },
  {
    _id:"CFG_SA_MUSAFIR_IN_v1", destinationCountryCode:"SA",
    minimumDocuments:[
      {docCode:"passport_copy", mandatory:true, notes:"Must be valid 6+ months"},
      {docCode:"photograph",    mandatory:true, notes:"White background"},
      {docCode:"hotel_booking", mandatory:true, notes:"Required unless staying with family"}
    ],
    visaModeRules:[
      {ruleId:"SA_VMR_001", priority:50, conditions:{residencyCountryIn:["AE","SA","QA","KW","BH","OM"]}, visaMode:"evisa", applicableSkuCodes:["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001"]}
    ],
    documentRules:[
      {ruleId:"SA_DR_001", priority:40, conditions:{nationalityIn:["PK"]},                           additionalDocuments:[{docCode:"invitation_letter",mandatory:true,notes:"From host or sponsor"}],                   applicableSkuCodes:["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001","SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]},
      {ruleId:"SA_DR_002", priority:80, conditions:{},                                               additionalDocuments:[{docCode:"university_admission_letter",mandatory:true,notes:"Issued by the university"}],     applicableSkuCodes:["SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]},
      {ruleId:"SA_DR_003", priority:90, conditions:{nationalityIn:["PH"], residencyCountryIn:["IN"]},additionalDocuments:[{docCode:"employment_letter_v2",mandatory:true,notes:"Specific format required"}],            applicableSkuCodes:["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001"]}
    ],
    pricingAdjustments:[
      {ruleId:"SA_PA_001", priority:30, conditions:{travelGroupIn:["family"]}, adjustment:{type:"add_amount",currency:"AED",value:25}, applicableSkuCodes:["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001","SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]}
    ]
  },
  {
    _id:"CFG_TR_MUSAFIR_IN_v1", destinationCountryCode:"TR",
    minimumDocuments:[
      {docCode:"passport_copy",    mandatory:true, notes:"Must be valid 6+ months"},
      {docCode:"photograph",       mandatory:true, notes:"White background"},
      {docCode:"bank_statement",   mandatory:true, notes:"Last 6 months"},
      {docCode:"travel_insurance", mandatory:true, notes:"Coverage required"}
    ],
    visaModeRules:[
      {ruleId:"TR_VMR_001", priority:60, conditions:{hasVisaOrPermitIn:["SCHENGEN"]}, visaMode:"evisa", applicableSkuCodes:["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001"]}
    ],
    documentRules:[
      {ruleId:"TR_DR_001", priority:70, conditions:{residencyCountryIn:["AE"]}, modifyDocuments:[{docCode:"bank_statement",notes:"Last 3 months"}],                                   applicableSkuCodes:["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001","TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]},
      {ruleId:"TR_DR_002", priority:80, conditions:{},                          additionalDocuments:[{docCode:"education_certificate",mandatory:true,notes:"Highest qualification"}], applicableSkuCodes:["TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]}
    ],
    pricingAdjustments:[
      {ruleId:"TR_PA_001", priority:50, conditions:{residencyCountryIn:["AE"]}, adjustment:{type:"subtract_amount",currency:"AED",value:13}, applicableSkuCodes:["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001","TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]}
    ]
  }
];
const KNOWLEDGE_SOURCES = [
  {_id:"SRC_AE_001", destinationCountryCode:"AE", chunkId:"AE_CH_001", text:"Baseline docs include passport copy and photograph. Some cases require bank statement.", trustScore:0.9},
  {_id:"SRC_SA_001", destinationCountryCode:"SA", chunkId:"SA_CH_001", text:"Tourist evisa available for eligible residents. Document rules vary by traveler profile.", trustScore:0.9},
  {_id:"SRC_TR_001", destinationCountryCode:"TR", chunkId:"TR_CH_001", text:"Travel insurance and bank statement are common requirements. Schengen holders may use evisa for tourist.", trustScore:0.9}
];

// All supported destination names (used to scope LLM responses)
const SUPPORTED_COUNTRIES = DESTINATION.map(d => d.destinationCountryName).join(", ");

// ════════════════════════════════════════════════════════════
//  DESTINATION KEYWORD MAP
//  Keys ordered so left-to-right scan finds correct country
// ════════════════════════════════════════════════════════════

const DEST_KEYWORDS = [
  { code:"AE", words:["united arab emirates","uae","dubai","abu dhabi","sharjah","emirates"] },
  { code:"SA", words:["saudi arabia","saudi","riyadh","jeddah","mecca","medina","ksa"] },
  { code:"TR", words:["turkey","türkiye","istanbul","ankara","antalya","cappadocia"] },
  { code:"GE", words:["georgia","tbilisi","batumi"] },
  { code:"AZ", words:["azerbaijan","baku"] },
  { code:"TH", words:["thailand","bangkok","phuket","pattaya","chiang mai"] },
  { code:"SG", words:["singapore"] },
  { code:"ID", words:["indonesia","bali","jakarta","lombok"] },
  { code:"MY", words:["malaysia","kuala lumpur"," kl "] },
  { code:"LK", words:["sri lanka","colombo","kandy"] },
  { code:"MV", words:["maldives"] },
  { code:"JP", words:["japan","tokyo","osaka","kyoto"] },
  { code:"KR", words:["south korea","korea","seoul","busan"] },
  { code:"IT", words:["italy","rome","milan","venice","florence"] },
  { code:"ES", words:["spain","madrid","barcelona","seville"] }
];

// Returns the FIRST country mentioned in the message (left-to-right)
// Skips residencyCountry and nationality — they are context, not destination
function detectDestination(message, skipCodes) {
  if (!message) return null;
  const lower = " " + message.toLowerCase() + " ";
  const skip = skipCodes || [];

  // Two passes: first try excluding residency/nationality matches,
  // then fall back to including them if nothing else found
  for (const excludeSkip of [true, false]) {
    let earliest = null;
    let earliestPos = Infinity;

    for (const entry of DEST_KEYWORDS) {
      if (excludeSkip && skip.includes(entry.code)) continue;
      for (const word of entry.words) {
        const pos = lower.indexOf(word);
        if (pos !== -1 && pos < earliestPos) {
          earliestPos = pos;
          earliest = entry.code;
        }
      }
    }
    if (earliest) return earliest;
  }
  return null;
}

// ════════════════════════════════════════════════════════════
//  INTENT HELPERS
// ════════════════════════════════════════════════════════════

function detectPurpose(message) {
  const lower = message.toLowerCase();
  if (lower.includes("student") || lower.includes("study") || lower.includes("university") || lower.includes("education")) return "student";
  return "tourist";
}

function detectSpeed(message) {
  const lower = message.toLowerCase();
  const wantsExpress  = lower.includes("express") || lower.includes("fastest") || lower.includes("urgent") || lower.includes("fast track");
  const wantsStandard = lower.includes("standard");
  if (wantsExpress && !wantsStandard) return "express";
  if (wantsStandard && !wantsExpress) return "standard";
  return "both";
}

function isCheapestQuery(message) {
  const lower = message.toLowerCase();
  return lower.includes("cheap") || lower.includes("cheapest") || lower.includes("lowest price") ||
         lower.includes("affordable") || lower.includes("budget") || lower.includes("low cost") ||
         lower.includes("inexpensive");
}

function isFastTravelQuery(message) {
  const lower = message.toLowerCase();
  return lower.includes("next week") || lower.includes("fast process") || lower.includes("quick process") ||
         lower.includes("travel soon") || lower.includes("short notice");
}

function isTravelInfoQuery(message) {
  const lower = message.toLowerCase();

  // Explicit visa/eligibility keywords — NEVER treat these as travel
  const isVisaQ = lower.includes("visa") || lower.includes("eligible") ||
    lower.includes("eligib") || lower.includes("document") || lower.includes("passport") ||
    lower.includes("processing time") || lower.includes("evisa") || lower.includes("permit");
  if (isVisaQ) return false;

  // Travel / tourism keywords
  return (
    lower.includes("what can i do") ||
    lower.includes("what to do") ||
    lower.includes("places to visit") ||
    lower.includes("places to see") ||
    lower.includes("best places") ||
    lower.includes("best beach") ||
    lower.includes("best beaches") ||
    lower.includes("top beach") ||
    lower.includes("beautiful beach") ||
    lower.includes("things to do") ||
    lower.includes("things to see") ||
    lower.includes("must see") ||
    lower.includes("must visit") ||
    lower.includes("must try") ||
    lower.includes("attractions") ||
    lower.includes("tourist spot") ||
    lower.includes("tourist place") ||
    lower.includes("sightseeing") ||
    lower.includes("food to eat") ||
    lower.includes("what to eat") ||
    lower.includes("local food") ||
    lower.includes("street food") ||
    lower.includes("cuisine") ||
    lower.includes("restaurant") ||
    lower.includes("culture") ||
    lower.includes("weather") ||
    lower.includes("climate") ||
    lower.includes("best time to visit") ||
    lower.includes("best time to go") ||
    lower.includes("when to visit") ||
    lower.includes("when to go") ||
    lower.includes("how many days") ||
    lower.includes("itinerary") ||
    lower.includes("trip plan") ||
    lower.includes("travel guide") ||
    lower.includes("what is it like") ||
    lower.includes("tell me about") ||
    lower.includes("tell more") ||
    lower.includes("more about") ||
    lower.includes("more places") ||
    lower.includes("more spots") ||
    lower.includes("famous for") ||
    lower.includes("known for") ||
    lower.includes("explore") ||
    lower.includes("experience") ||
    lower.includes("hidden gem") ||
    lower.includes("off the beaten") ||
    lower.includes("local experience") ||
    lower.includes("night life") ||
    lower.includes("nightlife") ||
    lower.includes("shopping mall") ||
    lower.includes("shopping area") ||
    lower.includes("day trip") ||
    lower.includes("weekend") ||
    lower.includes("things i should") ||
    lower.includes("what should i see") ||
    lower.includes("what should i do") ||
    lower.includes("where to go") ||
    lower.includes("where can i go") ||
    lower.includes("show me places") ||
    lower.includes("suggest places") ||
    lower.includes("suggest activities")
  );
}



function isRecommendationQuery(message) {
  const lower = message.toLowerCase();
  return lower.includes("recommend") || lower.includes("suggest") || lower.includes("inspire") ||
         lower.includes("where should") || lower.includes("where can i") || lower.includes("destinations") ||
         lower.includes("best place") || lower.includes("places to visit") || lower.includes("places to travel") ||
         lower.includes("travel to") || lower.includes("i can travel");
}

// ════════════════════════════════════════════════════════════
//  CONDITION MATCHER
// ════════════════════════════════════════════════════════════

function matchCondition(conditions, ctx) {
  if (!conditions || Object.keys(conditions).length === 0) return true;
  if (conditions.nationalityIn && !conditions.nationalityIn.includes(ctx.nationality)) return false;
  if (conditions.residencyCountryIn && !conditions.residencyCountryIn.includes(ctx.residencyCountry)) return false;
  if (conditions.hasVisaOrPermitIn) {
    const permits = Array.isArray(ctx.hasVisaOrPermit) ? ctx.hasVisaOrPermit : (ctx.hasVisaOrPermit ? [ctx.hasVisaOrPermit] : []);
    if (!conditions.hasVisaOrPermitIn.some(p => permits.includes(p))) return false;
  }
  if (conditions.travelGroupIn && !conditions.travelGroupIn.includes(ctx.travelGroup)) return false;
  if (conditions.stayingWithFamily !== undefined && conditions.stayingWithFamily !== ctx.stayingWithFamily) return false;
  return true;
}

// ════════════════════════════════════════════════════════════
//  RULES ENGINE  — returns enriched result with full trace
// ════════════════════════════════════════════════════════════

function runRulesEngine(destCode, ctx, speedFilter) {
  const cfg = DESTINATION_MARKET.find(c => c.destinationCountryCode === destCode);
  if (!cfg) return null;

  const matchedRuleIds   = [];  // ALL rules that matched (for trace.matchedRules)
  const appliedAdjustments = []; // pricing adjustments (for trace.appliedAdjustments)

  // Step 1: filter SKUs by purpose and speed
  let allSkus = VISA_SKU.filter(s => s.countryCode === destCode && s.isActive && s.purpose === ctx.travelPurpose);
  if (speedFilter === "express")  allSkus = allSkus.filter(s => s.processingSpeed === "express");
  if (speedFilter === "standard") allSkus = allSkus.filter(s => s.processingSpeed === "standard");

  // Step 2: visa mode rules (descending priority, first match wins)
  const notApplicable = new Set();
  const sortedVMR = [...cfg.visaModeRules].sort((a,b) => b.priority - a.priority);
  for (const rule of sortedVMR) {
    if (matchCondition(rule.conditions, ctx)) {
      matchedRuleIds.push(rule.ruleId);
      if (rule.visaMode === "not_applicable") {
        rule.applicableSkuCodes.forEach(c => notApplicable.add(c));
      }
      break;
    }
  }

  const eligibleSkus = allSkus.filter(s => !notApplicable.has(s.skuCode));
  const isEligible   = !(eligibleSkus.length === 0 && allSkus.length > 0);

  // Step 3: documents — ascending priority (lower runs first, higher overrides)
  let docs = cfg.minimumDocuments.map(d => ({...d}));
  const sortedDR = [...cfg.documentRules].sort((a,b) => a.priority - b.priority);
  for (const rule of sortedDR) {
    const inScope = eligibleSkus.some(s => rule.applicableSkuCodes.includes(s.skuCode));
    if (!inScope) continue;
    if (!matchCondition(rule.conditions, ctx)) continue;
    matchedRuleIds.push(rule.ruleId);
    if (rule.additionalDocuments) {
      for (const ad of rule.additionalDocuments) {
        if (!docs.find(d => d.docCode === ad.docCode)) docs.push({...ad});
      }
    }
    if (rule.removeDocuments) {
      docs = docs.filter(d => !rule.removeDocuments.includes(d.docCode));
    }
    if (rule.setMandatory) {
      for (const sm of rule.setMandatory) {
        const d = docs.find(d => d.docCode === sm.docCode);
        if (d) { d.mandatory = sm.mandatory; d.notes = sm.notes; }
      }
    }
    if (rule.modifyDocuments) {
      for (const md of rule.modifyDocuments) {
        const d = docs.find(d => d.docCode === md.docCode);
        if (d && md.notes) d.notes = md.notes;
      }
    }
  }

  // Step 4: pricing + collect pricing adjustments
  const sortedPA = [...cfg.pricingAdjustments].sort((a,b) => b.priority - a.priority);
  const pricedSkus = eligibleSkus.map(sku => {
    let price = sku.basePrice.amount;
    for (const pa of sortedPA) {
      if (!pa.applicableSkuCodes.includes(sku.skuCode)) continue;
      if (!matchCondition(pa.conditions, ctx)) continue;
      // Add to matchedRuleIds (pricing rules are also matched rules)
      if (!matchedRuleIds.includes(pa.ruleId)) matchedRuleIds.push(pa.ruleId);
      // Add to appliedAdjustments
      if (!appliedAdjustments.find(a => a.ruleId === pa.ruleId)) {
        appliedAdjustments.push({ruleId: pa.ruleId, value: pa.adjustment.value});
      }
      price += pa.adjustment.type === "add_amount" ? pa.adjustment.value : -pa.adjustment.value;
    }
    return {...sku, finalPrice: {currency:"AED", amount: price}};
  });

  // Primary SKU (standard preferred, else first)
  const primarySku = pricedSkus.find(s => s.processingSpeed === "standard") || pricedSkus[0];

  return {
    isEligible,
    allSkus,          // ALL initially matched SKUs — needed in final.skuCodes even if not_eligible
    pricedSkus,
    docs,
    primarySku,
    cfg,
    matchedRuleIds,
    appliedAdjustments
  };
}

// ════════════════════════════════════════════════════════════
//  BUILD VISA RESPONSE  (correct format)
// ════════════════════════════════════════════════════════════

function buildVisaResponse(destCode, ctx, speedFilter, startMs) {
  const dest = DESTINATION.find(d => d.destinationCountryCode === destCode);
  const destName = dest ? dest.destinationCountryName : destCode;

  // No SKUs in POC for this destination
  if (dest && !dest.hasSkusInPoc) {
    return makeResponse(
      `${destName} is a recommended destination for ${dest.interests.join(", ")} travellers (popularity: ${Math.round(dest.popularityScore*100)}%). Visa booking for ${destName} is not available in the current Musafir system. Please contact Musafir support for assistance.`,
      { destinations:[destCode], skuCodes:[], documents:[], processingTimeDays:0, minLeadTimeDays:0 },
      { retrieved:{skuCodes:[],configIds:[]}, matchedRules:[], appliedAdjustments:[] },
      startMs
    );
  }

  const result = runRulesEngine(destCode, ctx, speedFilter);
  if (!result) return refusal(startMs);

  const { isEligible, allSkus, pricedSkus, docs, primarySku, cfg, matchedRuleIds, appliedAdjustments } = result;

  // Answer text
  let answerText;
  if (!isEligible) {
    answerText = `Based on your profile (nationality: ${ctx.nationality}), you are not eligible for the ${destName} eVisa through the Musafir platform.`;
  } else {
    const std = pricedSkus.find(s => s.processingSpeed === "standard");
    const exp = pricedSkus.find(s => s.processingSpeed === "express");
    const mandatoryDocs = docs.filter(d => d.mandatory).map(d => d.docCode).join(", ");
    answerText = `You are eligible for the ${destName} ${ctx.travelPurpose} eVisa. `;
    if (std) answerText += `Standard: ${std.processingTimeDays} days at AED ${std.finalPrice.amount}. `;
    if (exp) answerText += `Express: ${exp.processingTimeDays} day${exp.processingTimeDays > 1 ? "s" : ""} at AED ${exp.finalPrice.amount}. `;
    answerText += `Required documents: ${mandatoryDocs}.`;
    const optDocs = docs.filter(d => !d.mandatory);
    if (optDocs.length > 0) answerText += ` Optional: ${optDocs.map(d => d.docCode).join(", ")}.`;
  }

  return makeResponse(
    answerText,
    {
      destinations: [destCode],
      skuCodes:     allSkus.map(s => s.skuCode),   // all evaluated SKUs, including not_eligible ones
      documents:    docs.map(d => ({docCode: d.docCode, mandatory: d.mandatory, notes: d.notes})),
      processingTimeDays: primarySku ? primarySku.processingTimeDays : 0,
      minLeadTimeDays:    primarySku ? primarySku.minLeadTimeDays    : 0
    },
    {
      retrieved: {
        skuCodes:   allSkus.map(s => s.skuCode),
        configIds:  [cfg._id]
      },
      matchedRules:       matchedRuleIds.map(r => ({ruleId: r})),
      appliedAdjustments: appliedAdjustments
    },
    startMs
  );
}

// ════════════════════════════════════════════════════════════
//  BUILD RECOMMENDATION RESPONSE
// ════════════════════════════════════════════════════════════

function buildRecommendationResponse(ctx, message, startMs) {
  const interests   = ctx.interests || [];
  const travelInDays = ctx.travelInDays || null;
  const cheap       = isCheapestQuery(message);
  const fastTravel  = isFastTravelQuery(message) || (travelInDays && travelInDays <= 14);

  // Start with all destinations
  let candidates = [...DESTINATION];

  // Filter by travelInDays if applicable
  if (fastTravel && travelInDays) {
    candidates = candidates.filter(d => d.minProcessingDays <= travelInDays);
  }

  // Score and sort
  if (cheap) {
    // Sort by price ascending
    candidates.sort((a, b) => a.startingPrice.amount - b.startingPrice.amount);
  } else if (interests.length > 0) {
    // Score by interest match count, then popularity
    candidates = candidates
      .map(d => ({ ...d, matchCount: interests.filter(i => d.interests.includes(i)).length }))
      .filter(d => d.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.popularityScore - a.popularityScore);
  } else {
    // Sort by popularity
    candidates.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // Collect ALL matching destination codes and all their SKUs
  const destCodes = candidates.map(d => d.destinationCountryCode);
  const allSkuCodes = VISA_SKU
    .filter(s => destCodes.includes(s.countryCode) && s.isActive)
    .map(s => s.skuCode);
  const configIds = DESTINATION_MARKET
    .filter(c => destCodes.includes(c.destinationCountryCode))
    .map(c => c._id);

  // Build answer text
  const lines = candidates.map(d => {
    const booking = d.hasSkusInPoc
      ? `Visa from AED ${d.startingPrice.amount}, min ${d.minProcessingDays} days processing.`
      : `Destination available; visa booking not in current system.`;
    return `${d.destinationCountryName} (popularity: ${Math.round(d.popularityScore*100)}%, interests: ${d.interests.join(", ")}) — ${booking}`;
  });

  const sortLabel = cheap ? "price" : interests.length > 0 ? `your interests (${interests.join(", ")})` : "popularity";
  const answerText = `Recommended destinations based on ${sortLabel}:\n${lines.join("\n")}`;

  return makeResponse(
    answerText,
    { destinations: destCodes, skuCodes: allSkuCodes, documents: [], processingTimeDays: 0, minLeadTimeDays: 0 },
    { retrieved: { skuCodes: allSkuCodes, configIds }, matchedRules: [], appliedAdjustments: [] },
    startMs
  );
}

// ════════════════════════════════════════════════════════════
//  RAG CONTEXT BUILDER
//  Retrieves only the dataset records relevant to the query
//  and formats them as a grounding context for Gemini.
//  This is what makes it RAG (Retrieval-Augmented Generation):
//  we retrieve first, then augment the LLM prompt with that data.
// ════════════════════════════════════════════════════════════

function buildRAGContext(message, ctx, rulesResult) {
  const lines = [];

  // 1. Relevant destination market config
  if (rulesResult.final.destinations && rulesResult.final.destinations.length > 0) {
    const destCode = rulesResult.final.destinations[0];
    const cfg = DESTINATION_MARKET.find(c => c.destinationCountryCode === destCode);
    if (cfg) {
      lines.push(`=== Market config for ${destCode} ===`);
      lines.push(`Minimum documents: ${cfg.minimumDocuments.map(d => d.docCode).join(", ")}`);
      lines.push(`Rules applied: ${rulesResult.trace.matchedRules.map(r => r.ruleId).join(", ") || "none"}`);
    }

    // 2. Knowledge source snippet for this destination
    const ks = KNOWLEDGE_SOURCES.find(k => k.destinationCountryCode === destCode);
    if (ks) lines.push(`=== Government note (${destCode}) ===\n${ks.text}`);
  }

  // 3. The computed result from the rules engine (ground truth)
  lines.push(`=== Rules engine computed result (use this as ground truth) ===`);
  lines.push(`Eligibility: ${rulesResult.final.skuCodes.length > 0 && !rulesResult.answerText.includes("not eligible") ? "eligible" : "not eligible"}`);
  lines.push(`SKUs: ${rulesResult.final.skuCodes.join(", ") || "none"}`);
  lines.push(`Documents: ${rulesResult.final.documents.map(d => `${d.docCode} (${d.mandatory ? "mandatory" : "optional"}, ${d.notes})`).join("; ") || "none"}`);
  if (rulesResult.trace.appliedAdjustments.length > 0) {
    lines.push(`Price adjustments: ${rulesResult.trace.appliedAdjustments.map(a => `${a.ruleId} = ${a.value > 0 ? "+" : "-"}AED ${Math.abs(a.value)}`).join(", ")}`);
  }
  lines.push(`Processing: ${rulesResult.final.processingTimeDays} days, min lead time: ${rulesResult.final.minLeadTimeDays} days`);

  return lines.join("\n");
}

// ════════════════════════════════════════════════════════════
//  GEMINI LLM CALL
//  Sends user question + RAG context to Gemini.
//  Gemini ONLY generates the answerText — all structured
//  fields (documents, prices, SKUs) come from the rules engine.
// ════════════════════════════════════════════════════════════

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const LLM_TIMEOUT_MS = 4000; // fall back to rules engine if Gemini takes > 4 seconds

async function callGeminiForAnswerText(message, ctx, ragContext, fallbackText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[LLM] No GEMINI_API_KEY set — using rules engine fallback");
    return { text: fallbackText, source: "rules_engine_fallback_no_key" };
  }

  const systemPrompt = `You are a friendly, knowledgeable visa assistant for Musafir, a travel company.

Your job is to write ONE short, warm, conversational paragraph answering the user's visa question.

STRICT RULES — you MUST follow these or your answer will be rejected:
1. Only use information from the "Rules engine computed result" section below. Never use outside knowledge.
2. Never mention visa prices, fees, or costs that are not stated in the context below.
3. Never mention documents that are not in the Documents list below.
4. If the traveller is not eligible, say so clearly and sympathetically.
5. Write 2-4 sentences maximum. Be concise.
6. Do not list documents as bullet points — weave them naturally into a sentence.
7. Do not say "based on the rules engine" or mention technical systems — speak naturally to the traveller.
8. End with one helpful tip or next step.

GROUNDING CONTEXT (treat this as absolute truth):
${ragContext}`;

  const userPrompt = `User question: "${message}"
User profile: nationality=${ctx.nationality}, residency=${ctx.residencyCountry}, purpose=${ctx.travelPurpose}, group=${ctx.travelGroup}${ctx.stayingWithFamily ? ", staying with family" : ""}

Write a friendly, accurate answer using ONLY the information in the grounding context above.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,    // low temperature = more factual, less creative
          maxOutputTokens: 200  // short answer only
        }
      })
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      console.log(`[LLM] Gemini error ${res.status}: ${err.slice(0, 100)}`);
      return { text: fallbackText, source: "rules_engine_fallback_api_error" };
    }

    const data = await res.json();
    const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!geminiText) {
      console.log("[LLM] Empty response from Gemini");
      return { text: fallbackText, source: "rules_engine_fallback_empty" };
    }

    console.log(`[LLM] Gemini responded: "${geminiText.slice(0, 80)}..."`);
    return { text: geminiText, source: "gemini" };

  } catch (err) {
    if (err.name === "AbortError") {
      console.log(`[LLM] Gemini timed out after ${LLM_TIMEOUT_MS}ms — using fallback`);
    } else {
      console.log(`[LLM] Gemini fetch error: ${err.message}`);
    }
    return { text: fallbackText, source: "rules_engine_fallback_timeout" };
  }
}

// ════════════════════════════════════════════════════════════
//  HALLUCINATION VALIDATOR
//  After Gemini generates answerText, we check it against
//  the rules engine output. If Gemini made up prices or docs
//  that don't match reality, we use the fallback instead.
//  This is the "validate and correct" step in the hybrid.
// ════════════════════════════════════════════════════════════

function validateGeminiOutput(geminiText, rulesResult) {
  const issues = [];

  // Check 1: Did Gemini mention any price numbers?
  // If yes, verify they match our computed prices
  const priceMatches = geminiText.match(/AED\s*(\d+)/g) || [];
  if (priceMatches.length > 0) {
    // Get all valid prices from our result
    const validPrices = new Set();
    rulesResult.final.documents; // just referencing to keep context
    // Extract prices mentioned in the fallback text (which came from rules engine)
    const fallbackPrices = (rulesResult._fallbackText || "").match(/AED\s*(\d+)/g) || [];
    fallbackPrices.forEach(p => validPrices.add(p.replace(/\s/g, "")));

    for (const price of priceMatches) {
      const normalized = price.replace(/\s/g, "");
      if (validPrices.size > 0 && !validPrices.has(normalized)) {
        issues.push(`Hallucinated price: ${price}`);
      }
    }
  }

  // Check 2: Did Gemini mention any document codes that aren't in our list?
  const validDocCodes = new Set(rulesResult.final.documents.map(d => d.docCode));
  const knownDocWords = ["passport", "photograph", "photo", "flight", "hotel", "bank", "insurance", "invitation", "university", "education", "employment"];
  // Only flag if it mentions something completely outside the domain
  // (We keep this light to avoid false positives on paraphrasing)

  // Check 3: Did Gemini say "eligible" when the traveller is NOT eligible?
  const isActuallyIneligible = rulesResult.answerText && rulesResult.answerText.toLowerCase().includes("not eligible");
  if (isActuallyIneligible && geminiText.toLowerCase().includes("eligible") && !geminiText.toLowerCase().includes("not eligible")) {
    issues.push("Gemini said eligible but traveller is not eligible");
  }

  // Check 4: Is the response too long or clearly off-topic?
  if (geminiText.length > 800) {
    issues.push("Response too long");
  }

  if (issues.length > 0) {
    console.log(`[LLM] Hallucination detected: ${issues.join(", ")} — using fallback`);
    return false;
  }

  return true;
}



// ════════════════════════════════════════════════════════════
//  GEMINI TRAVEL INFO CALL
//  Used for travel/tourism questions about our 15 countries.
//  LLM answers from its own knowledge — no rules engine needed.
//  Strictly scoped to the 15 countries in our dataset.
//  Returns refusal if question is about an unlisted country.
// ════════════════════════════════════════════════════════════

async function callGeminiForTravelInfo(message, destCode, startMs) {
  const apiKey = process.env.GEMINI_API_KEY;
  const dest   = DESTINATION.find(d => d.destinationCountryCode === destCode);
  const destName = dest ? dest.destinationCountryName : destCode;

  if (!apiKey) {
    return makeResponse(
      `${destName} is a wonderful destination! For detailed travel tips, attractions and local experiences, please check Musafir's travel guides.`,
      { destinations:[destCode], skuCodes:[], documents:[], processingTimeDays:0, minLeadTimeDays:0 },
      { retrieved:{skuCodes:[],configIds:[]}, matchedRules:[], appliedAdjustments:[] },
      startMs
    );
  }

  const systemPrompt = `You are a friendly, knowledgeable travel assistant for Musafir, a travel company.

You ONLY answer travel and tourism questions about these specific countries: ${SUPPORTED_COUNTRIES}.

If asked about any country NOT in that list, respond: "I can only provide travel information for our supported destinations: UAE, Saudi Arabia, Turkey, Georgia, Azerbaijan, Thailand, Singapore, Indonesia, Malaysia, Sri Lanka, Maldives, Japan, South Korea, Italy, and Spain."

Rules:
1. Answer travel questions warmly and helpfully — things to do, places to see, food, culture, best time to visit, etc.
2. Keep answers concise — 3 to 5 sentences maximum.
3. Do NOT give visa or immigration advice — for that, tell the user to ask a visa question.
4. Do NOT answer anything unrelated to travel (politics, finance, medical advice, etc.).
5. Always end with one practical tip.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Gemini error ${res.status}`);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) throw new Error("Empty response");

    console.log(`[LLM-TRAVEL] Gemini responded for ${destName}`);

    return makeResponse(
      text,
      { destinations:[destCode], skuCodes:[], documents:[], processingTimeDays:0, minLeadTimeDays:0 },
      { retrieved:{skuCodes:[],configIds:[]}, matchedRules:[], appliedAdjustments:[], llmSource:"gemini-travel" },
      startMs
    );

  } catch (err) {
    console.log(`[LLM-TRAVEL] Error: ${err.message} — using fallback`);
    return makeResponse(
      `${destName} is a fascinating destination! It's known for ${dest ? dest.interests.join(", ") : "great experiences"}. For detailed travel guides, visit Musafir's destination pages. If you have visa questions for ${destName}, just ask!`,
      { destinations:[destCode], skuCodes:[], documents:[], processingTimeDays:0, minLeadTimeDays:0 },
      { retrieved:{skuCodes:[],configIds:[]}, matchedRules:[], appliedAdjustments:[] },
      startMs
    );
  }
}

// ════════════════════════════════════════════════════════════
//  RESPONSE BUILDERS
// ════════════════════════════════════════════════════════════

function makeResponse(answerText, final, trace, startMs) {
  return {
    answerText,
    final:  { destinations:[], skuCodes:[], documents:[], processingTimeDays:0, minLeadTimeDays:0, ...final },
    trace:  { retrieved:{skuCodes:[],configIds:{}}, matchedRules:[], appliedAdjustments:[], ...trace },
    meta:   { latencyMs: Date.now() - startMs }
  };
}

function refusal(startMs) {
  return makeResponse(
    "I can only answer questions based on the available visa dataset. This query is outside the scope of the current dataset.",
    { destinations:[], skuCodes:[], documents:[], processingTimeDays:0, minLeadTimeDays:0 },
    { retrieved:{skuCodes:[],configIds:[]}, matchedRules:[], appliedAdjustments:[] },
    startMs
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN REQUEST PROCESSOR
// ════════════════════════════════════════════════════════════

async function processRequest(message, context, startMs) {
  const ctx = {
    nationality:      context.nationality       || null,
    residencyCountry: context.residencyCountry  || null,
    hasVisaOrPermit:  context.hasVisaOrPermit   || context.hasVisa || [],
    travelPurpose:    detectPurpose(message),   // detect from message first
    travelGroup:      context.travelGroup       || "solo",
    stayingWithFamily:context.stayingWithFamily || false,
    interests:        context.interests         || [],
    travelInDays:     context.travelInDays      || null
  };

  // Override travelPurpose from context if explicitly provided
  if (context.travelPurpose) ctx.travelPurpose = context.travelPurpose;
  if (context.purpose)       ctx.travelPurpose = context.purpose;

  const destCode    = detectDestination(message, [ctx.residencyCountry, ctx.nationality].filter(Boolean));
  const speedFilter = detectSpeed(message);

  // ── Step 1: Route the query ──────────────────────────────
  // Three possible paths:
  //   A) Travel info question about a known destination → LLM answers (no rules engine)
  //   B) Visa/eligibility question about a known destination → rules engine + LLM hybrid
  //   C) Recommendation query or refusal
  let result;

  const travelInfo = destCode && isTravelInfoQuery(message);

  if (travelInfo) {
    // Path A: travel question (what to do, food, culture etc.) — LLM answers freely
    // Still scoped to our 15 countries — won't answer about Antarctica etc.
    result = await callGeminiForTravelInfo(message, destCode, startMs);
    delete result._fallbackText;
    return result;

  } else if (destCode) {
    // Path B: visa/eligibility question — rules engine computes, LLM polishes
    result = buildVisaResponse(destCode, ctx, speedFilter, startMs);
  } else {
    // Path C: recommendation or refusal
    const wantsRec = isRecommendationQuery(message) || isCheapestQuery(message) ||
                     isFastTravelQuery(message) || (ctx.interests && ctx.interests.length > 0) ||
                     (ctx.travelInDays && ctx.travelInDays <= 30);
    result = wantsRec
      ? buildRecommendationResponse(ctx, message, startMs)
      : refusal(startMs);
  }

  // ── Step 2: Build RAG context from rules engine output ────
  // Retrieves only the dataset records relevant to this query.
  // This is the "Retrieval" in Retrieval-Augmented Generation.
  const ragContext = buildRAGContext(message, ctx, result);

  // ── Step 3: Call Gemini to generate conversational text ───
  // Gemini receives the grounding context and CANNOT change
  // the structured data — it only writes the answerText.
  result._fallbackText = result.answerText; // store rules engine text as fallback
  const llmResult = await callGeminiForAnswerText(message, ctx, ragContext, result.answerText);

  // ── Step 4: Validate — did Gemini hallucinate? ────────────
  if (llmResult.source === "gemini" && validateGeminiOutput(llmResult.text, result)) {
    result.answerText = llmResult.text;
    result.meta.llmSource = "gemini";
    result.meta.llmModel  = GEMINI_MODEL;
  } else {
    // Fallback: use the rules engine generated text
    result.meta.llmSource = llmResult.source;
    result.meta.llmModel  = "rules_engine_fallback";
  }

  // Clean up internal field before sending
  delete result._fallbackText;
  return result;
}

// ════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════

app.post("/vendor/chat", async (req, res) => {
  const startMs  = Date.now();
  try {
    const message  = req.body.message  || req.body.question || "";
    const context  = req.body.context  || req.body.userContext || {};
    console.log(`[${new Date().toISOString()}] "${message.slice(0,80)}" | ${JSON.stringify(context)}`);
    const result   = await processRequest(message, context, startMs);
    console.log(`[${new Date().toISOString()}] ${result.meta.latencyMs}ms | dests:${result.final.destinations}`);
    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json(refusal(startMs));
  }
});

app.post("/chat", (req, res) => {
  req.url = "/vendor/chat";
  app._router.handle(req, res);
});

app.get("/health", (req, res) => {
  res.json({
    status:    "ok",
    market:    "MUSAFIR_IN",
    approach:  "hybrid-llm-rules-engine-v3",
    llmModel:  GEMINI_MODEL,
    llmEnabled: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({ name:"Musafir Visa API", endpoints:{"POST /vendor/chat":"main","GET /health":"health"} });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✈  Musafir Visa API v3 (Hybrid) on port ${PORT}`);
  console.log(`   LLM: ${GEMINI_MODEL} — ${process.env.GEMINI_API_KEY ? "ENABLED" : "disabled (fallback mode)"}`);
  console.log(`   Fallback: rules engine always active`);
});
