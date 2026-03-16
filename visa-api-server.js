// ============================================================
//  Musafir Visa Chatbot
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
    pricedSkus,
    docs,
    primarySku,
    cfg,
    matchedRuleIds,
    appliedAdjustments
  };
}

// ════════════════════════════════════════════════════════════
//  BUILD VISA RESPONSE
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

  const { isEligible, pricedSkus, docs, primarySku, cfg, matchedRuleIds, appliedAdjustments } = result;

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
      skuCodes:     pricedSkus.map(s => s.skuCode),
      documents:    docs.map(d => ({docCode: d.docCode, mandatory: d.mandatory, notes: d.notes})),
      processingTimeDays: primarySku ? primarySku.processingTimeDays : 0,
      minLeadTimeDays:    primarySku ? primarySku.minLeadTimeDays    : 0
    },
    {
      retrieved: {
        skuCodes:   pricedSkus.map(s => s.skuCode),
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

function processRequest(message, context, startMs) {
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

  const destCode   = detectDestination(message, [ctx.residencyCountry, ctx.nationality].filter(Boolean));
  const speedFilter = detectSpeed(message);

  // ── 1. Specific destination mentioned → visa query ────────
  if (destCode) {
    return buildVisaResponse(destCode, ctx, speedFilter, startMs);
  }

  // ── 2. No destination → recommendation or refusal ─────────
  const wantsRec = isRecommendationQuery(message) || isCheapestQuery(message) ||
                   isFastTravelQuery(message) || (ctx.interests && ctx.interests.length > 0) ||
                   (ctx.travelInDays && ctx.travelInDays <= 30);

  if (wantsRec) {
    return buildRecommendationResponse(ctx, message, startMs);
  }

  return refusal(startMs);
}

// ════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════

app.post("/vendor/chat", (req, res) => {
  const startMs  = Date.now();
  try {
    const message  = req.body.message  || req.body.question || "";
    const context  = req.body.context  || req.body.userContext || {};
    console.log(`[${new Date().toISOString()}] "${message.slice(0,80)}" | ${JSON.stringify(context)}`);
    const result   = processRequest(message, context, startMs);
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
  res.json({ status:"ok", market:"MUSAFIR_IN", approach:"deterministic-rules-engine-v2", timestamp:new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ name:"Musafir Visa API", endpoints:{"POST /vendor/chat":"main","GET /health":"health"} });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✈  Musafir Visa API v2 on port ${PORT}`));
