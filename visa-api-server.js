// ============================================================
//  Musafir Visa Chatbot — Pure Rules Engine (No AI API needed)
//  Zero external dependencies beyond express + cors
//  Deploy: Render.com free tier
//  Endpoint: POST /vendor/chat
// ============================================================

const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════════════════
//  FULL DATASET
// ════════════════════════════════════════════════════════════

const VISA_SKU = [
  { _id:"AE_TOUR_30D_SGL_STD_001", skuCode:"AE_TOUR_30D_SGL_STD_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"tourist", validityDays:30, stayDays:30, processingMode:"evisa", processingSpeed:"standard", processingTimeDays:3, minLeadTimeDays:2, basePrice:{currency:"AED",amount:299}, ctaUrl:"/visa/ae-tourist-single-standard", isActive:true },
  { _id:"AE_TOUR_30D_SGL_EXP_001", skuCode:"AE_TOUR_30D_SGL_EXP_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"tourist", validityDays:30, stayDays:30, processingMode:"evisa", processingSpeed:"express",  processingTimeDays:1, minLeadTimeDays:1, basePrice:{currency:"AED",amount:339}, ctaUrl:"/visa/ae-tourist-single-express",  isActive:true },
  { _id:"AE_STUD_90D_SGL_STD_001", skuCode:"AE_STUD_90D_SGL_STD_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"student", validityDays:180, stayDays:90, processingMode:"evisa", processingSpeed:"standard", processingTimeDays:5, minLeadTimeDays:7, basePrice:{currency:"AED",amount:499}, ctaUrl:"/visa/ae-student-standard",         isActive:true },
  { _id:"AE_STUD_90D_SGL_EXP_001", skuCode:"AE_STUD_90D_SGL_EXP_001", countryCode:"AE", countryName:"United Arab Emirates", purpose:"student", validityDays:180, stayDays:90, processingMode:"evisa", processingSpeed:"express",  processingTimeDays:3, minLeadTimeDays:5, basePrice:{currency:"AED",amount:549}, ctaUrl:"/visa/ae-student-express",          isActive:true },
  { _id:"SA_TOUR_30D_SGL_STD_001", skuCode:"SA_TOUR_30D_SGL_STD_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"tourist", validityDays:30, stayDays:30, processingMode:"evisa", processingSpeed:"standard", processingTimeDays:3, minLeadTimeDays:2, basePrice:{currency:"AED",amount:309}, ctaUrl:"/visa/sa-tourist-single-standard", isActive:true },
  { _id:"SA_TOUR_30D_SGL_EXP_001", skuCode:"SA_TOUR_30D_SGL_EXP_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"tourist", validityDays:30, stayDays:30, processingMode:"evisa", processingSpeed:"express",  processingTimeDays:1, minLeadTimeDays:1, basePrice:{currency:"AED",amount:349}, ctaUrl:"/visa/sa-tourist-single-express",  isActive:true },
  { _id:"SA_STUD_90D_SGL_STD_001", skuCode:"SA_STUD_90D_SGL_STD_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"student", validityDays:180, stayDays:90, processingMode:"evisa", processingSpeed:"standard", processingTimeDays:6, minLeadTimeDays:7, basePrice:{currency:"AED",amount:514}, ctaUrl:"/visa/sa-student-standard",         isActive:true },
  { _id:"SA_STUD_90D_SGL_EXP_001", skuCode:"SA_STUD_90D_SGL_EXP_001", countryCode:"SA", countryName:"Saudi Arabia",          purpose:"student", validityDays:180, stayDays:90, processingMode:"evisa", processingSpeed:"express",  processingTimeDays:4, minLeadTimeDays:5, basePrice:{currency:"AED",amount:564}, ctaUrl:"/visa/sa-student-express",          isActive:true },
  { _id:"TR_TOUR_30D_SGL_STD_001", skuCode:"TR_TOUR_30D_SGL_STD_001", countryCode:"TR", countryName:"Turkey",                purpose:"tourist", validityDays:30, stayDays:30, processingMode:"evisa", processingSpeed:"standard", processingTimeDays:4, minLeadTimeDays:2, basePrice:{currency:"AED",amount:319}, ctaUrl:"/visa/tr-tourist-single-standard", isActive:true },
  { _id:"TR_TOUR_30D_SGL_EXP_001", skuCode:"TR_TOUR_30D_SGL_EXP_001", countryCode:"TR", countryName:"Turkey",                purpose:"tourist", validityDays:30, stayDays:30, processingMode:"evisa", processingSpeed:"express",  processingTimeDays:2, minLeadTimeDays:1, basePrice:{currency:"AED",amount:359}, ctaUrl:"/visa/tr-tourist-single-express",  isActive:true },
  { _id:"TR_STUD_90D_SGL_STD_001", skuCode:"TR_STUD_90D_SGL_STD_001", countryCode:"TR", countryName:"Turkey",                purpose:"student", validityDays:180, stayDays:90, processingMode:"evisa", processingSpeed:"standard", processingTimeDays:6, minLeadTimeDays:7, basePrice:{currency:"AED",amount:524}, ctaUrl:"/visa/tr-student-standard",         isActive:true },
  { _id:"TR_STUD_90D_SGL_EXP_001", skuCode:"TR_STUD_90D_SGL_EXP_001", countryCode:"TR", countryName:"Turkey",                purpose:"student", validityDays:180, stayDays:90, processingMode:"evisa", processingSpeed:"express",  processingTimeDays:4, minLeadTimeDays:5, basePrice:{currency:"AED",amount:574}, ctaUrl:"/visa/tr-student-express",          isActive:true }
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
      {ruleId:"AE_VMR_002", priority:100, conditions:{nationalityIn:["NG"]},                                                                                               visaMode:"not_applicable", applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001"]}
    ],
    documentRules:[
      {ruleId:"AE_DR_001", priority:50, conditions:{nationalityIn:["IN"]},                                                    additionalDocuments:[{docCode:"bank_statement",mandatory:true,notes:"Last 3 months"}],                              applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]},
      {ruleId:"AE_DR_002", priority:60, conditions:{nationalityIn:["IN"], residencyCountryIn:["AE","SA","QA","KW","BH","OM"]}, removeDocuments:["bank_statement"],                                                                               applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]},
      {ruleId:"AE_DR_003", priority:70, conditions:{stayingWithFamily:true},                                                  setMandatory:[{docCode:"hotel_booking",mandatory:false,notes:"Not needed if staying with family"}],                 applicableSkuCodes:["AE_TOUR_30D_SGL_STD_001","AE_TOUR_30D_SGL_EXP_001","AE_STUD_90D_SGL_STD_001","AE_STUD_90D_SGL_EXP_001"]}
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
      {ruleId:"SA_DR_001", priority:40, conditions:{nationalityIn:["PK"]},                           additionalDocuments:[{docCode:"invitation_letter",mandatory:true,notes:"From host or sponsor"}],                    applicableSkuCodes:["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001","SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]},
      {ruleId:"SA_DR_002", priority:80, conditions:{},                                               additionalDocuments:[{docCode:"university_admission_letter",mandatory:true,notes:"Issued by the university"}],      applicableSkuCodes:["SA_STUD_90D_SGL_STD_001","SA_STUD_90D_SGL_EXP_001"]},
      {ruleId:"SA_DR_003", priority:90, conditions:{nationalityIn:["PH"], residencyCountryIn:["IN"]},additionalDocuments:[{docCode:"employment_letter_v2",mandatory:true,notes:"Specific format required"}],             applicableSkuCodes:["SA_TOUR_30D_SGL_STD_001","SA_TOUR_30D_SGL_EXP_001"]}
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
      {ruleId:"TR_DR_001", priority:70, conditions:{residencyCountryIn:["AE"]}, modifyDocuments:[{docCode:"bank_statement",notes:"Last 3 months"}],                                    applicableSkuCodes:["TR_TOUR_30D_SGL_STD_001","TR_TOUR_30D_SGL_EXP_001","TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]},
      {ruleId:"TR_DR_002", priority:80, conditions:{},                          additionalDocuments:[{docCode:"education_certificate",mandatory:true,notes:"Highest qualification"}],  applicableSkuCodes:["TR_STUD_90D_SGL_STD_001","TR_STUD_90D_SGL_EXP_001"]}
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

// ════════════════════════════════════════════════════════════
//  DESTINATION KEYWORD DETECTION
//  Maps words/phrases in a message to a country code
// ════════════════════════════════════════════════════════════

const DEST_KEYWORDS = {
  AE: ["uae","dubai","abu dhabi","united arab emirates","emirates"],
  SA: ["saudi","saudi arabia","riyadh","jeddah","mecca","medina","ksa"],
  TR: ["turkey","türkiye","istanbul","ankara","antalya"],
  GE: ["georgia","tbilisi","batumi"],
  AZ: ["azerbaijan","baku"],
  TH: ["thailand","bangkok","phuket","pattaya","chiang mai"],
  SG: ["singapore"],
  ID: ["indonesia","bali","jakarta","lombok"],
  MY: ["malaysia","kuala lumpur","kl","langkawi"],
  LK: ["sri lanka","colombo","kandy"],
  MV: ["maldives","malé"],
  JP: ["japan","tokyo","osaka","kyoto","japan"],
  KR: ["south korea","korea","seoul","busan"],
  IT: ["italy","rome","milan","venice","florence"],
  ES: ["spain","madrid","barcelona","seville"]
};

function detectDestination(message) {
  if (!message) return null;
  const lower = message.toLowerCase();
  for (const [code, keywords] of Object.entries(DEST_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return code;
  }
  return null;
}

// ════════════════════════════════════════════════════════════
//  INTENT DETECTION
// ════════════════════════════════════════════════════════════

function detectIntent(message) {
  if (!message) return "visa_query";
  const lower = message.toLowerCase();

  // recommendation signals
  if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("where should") ||
      lower.includes("best place") || lower.includes("where to go") || lower.includes("destination") ||
      lower.includes("travel recommendation") || lower.includes("where can i")) {
    return "recommendation";
  }

  // document signals
  if (lower.includes("document") || lower.includes("requirement") || lower.includes("what do i need") ||
      lower.includes("papers") || lower.includes("paperwork")) {
    return "documents";
  }

  // price signals
  if (lower.includes("cost") || lower.includes("price") || lower.includes("fee") ||
      lower.includes("how much") || lower.includes("charges")) {
    return "pricing";
  }

  // processing time signals
  if (lower.includes("how long") || lower.includes("processing time") || lower.includes("days") ||
      lower.includes("duration") || lower.includes("fast") || lower.includes("quick") || lower.includes("express")) {
    return "processing";
  }

  // eligibility / general
  return "visa_query";
}

// ════════════════════════════════════════════════════════════
//  CONDITION MATCHING
// ════════════════════════════════════════════════════════════

function matchCondition(conditions, ctx) {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  if (conditions.nationalityIn) {
    if (!conditions.nationalityIn.includes(ctx.nationality)) return false;
  }
  if (conditions.residencyCountryIn) {
    if (!conditions.residencyCountryIn.includes(ctx.residencyCountry)) return false;
  }
  if (conditions.hasVisaOrPermitIn) {
    const permits = Array.isArray(ctx.hasVisaOrPermit)
      ? ctx.hasVisaOrPermit
      : (ctx.hasVisaOrPermit ? [ctx.hasVisaOrPermit] : []);
    if (!conditions.hasVisaOrPermitIn.some(p => permits.includes(p))) return false;
  }
  if (conditions.travelGroupIn) {
    if (!conditions.travelGroupIn.includes(ctx.travelGroup)) return false;
  }
  if (conditions.stayingWithFamily !== undefined) {
    if (conditions.stayingWithFamily !== ctx.stayingWithFamily) return false;
  }
  return true;
}

// ════════════════════════════════════════════════════════════
//  CORE RULES ENGINE
// ════════════════════════════════════════════════════════════

function runRulesEngine(destCode, ctx) {
  const cfg = DESTINATION_MARKET.find(c => c.destinationCountryCode === destCode);
  if (!cfg) return null;

  const refs = [{ collection:"destinationmarket", id:cfg._id }];

  // Step 1: filter SKUs
  const purpose = ctx.travelPurpose || "tourist";
  const allSkus = VISA_SKU.filter(s => s.countryCode === destCode && s.isActive && s.purpose === purpose);

  // Step 2: visa mode rules — descending priority, first match wins
  const sortedVMR = [...cfg.visaModeRules].sort((a,b) => b.priority - a.priority);
  const notApplicable = new Set();

  for (const rule of sortedVMR) {
    if (matchCondition(rule.conditions, ctx)) {
      refs.push({collection:"destinationmarket", id:cfg._id, field:rule.ruleId});
      if (rule.visaMode === "not_applicable") {
        rule.applicableSkuCodes.forEach(c => notApplicable.add(c));
      }
      break; // first match wins
    }
  }

  const eligibleSkus = allSkus.filter(s => !notApplicable.has(s.skuCode));
  const eligibility = eligibleSkus.length === 0 && allSkus.length > 0 ? "not_eligible" : "eligible";

  // Step 3: documents — start with minimum, apply ALL matching rules
  let docs = cfg.minimumDocuments.map(d => ({...d}));
  const sortedDR = [...cfg.documentRules].sort((a,b) => a.priority - b.priority); // ascending: low priority first, high priority overrides last

  for (const rule of sortedDR) {
    // check if any eligible sku is in this rule's scope
    const inScope = !rule.applicableSkuCodes ||
      eligibleSkus.some(s => rule.applicableSkuCodes.includes(s.skuCode));
    if (!inScope) continue;
    if (!matchCondition(rule.conditions, ctx)) continue;

    refs.push({collection:"destinationmarket", id:cfg._id, field:rule.ruleId});

    if (rule.additionalDocuments) {
      for (const ad of rule.additionalDocuments) {
        if (!docs.find(d => d.docCode === ad.docCode)) {
          docs.push({...ad});
        }
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

  // Step 4: pricing for each eligible SKU
  const sortedPA = [...cfg.pricingAdjustments].sort((a,b) => b.priority - a.priority);
  const recommendedSkus = eligibleSkus.map(sku => {
    refs.push({collection:"visasku", id:sku.skuCode});
    let price = sku.basePrice.amount;
    for (const pa of sortedPA) {
      if (!pa.applicableSkuCodes.includes(sku.skuCode)) continue;
      if (!matchCondition(pa.conditions, ctx)) continue;
      refs.push({collection:"destinationmarket", id:cfg._id, field:pa.ruleId});
      price += pa.adjustment.type === "add_amount" ? pa.adjustment.value : -pa.adjustment.value;
    }
    return {
      skuCode: sku.skuCode,
      processingSpeed: sku.processingSpeed,
      processingTimeDays: sku.processingTimeDays,
      finalPrice: {currency:"AED", amount:price},
      ctaUrl: sku.ctaUrl
    };
  });

  // Deduplicate refs
  const seen = new Set();
  const uniqueRefs = refs.filter(r => {
    const k = r.collection + r.id + (r.field || "");
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  return { eligibility, recommendedSkus, requiredDocuments:docs, references:uniqueRefs, cfg };
}

// ════════════════════════════════════════════════════════════
//  HUMAN-READABLE ANSWER BUILDER
// ════════════════════════════════════════════════════════════

const DOC_NAMES = {
  passport_copy:             "passport copy (valid 6+ months)",
  photograph:                "photograph (white background)",
  flight_itinerary:          "confirmed flight itinerary",
  hotel_booking:             "hotel booking",
  bank_statement:            "bank statement",
  travel_insurance:          "travel insurance",
  invitation_letter:         "invitation letter from host/sponsor",
  university_admission_letter:"university admission letter",
  education_certificate:     "education certificate (highest qualification)",
  employment_letter_v2:      "employment letter (specific format required)"
};

function buildAnswer(destCode, ctx, engineResult, intent) {
  const dest = DESTINATION.find(d => d.destinationCountryCode === destCode);
  const destName = dest ? dest.destinationCountryName : destCode;
  const { eligibility, recommendedSkus, requiredDocuments } = engineResult;

  if (eligibility === "not_eligible") {
    return `Based on your profile (nationality: ${ctx.nationality}), you are not eligible for the ${destName} eVisa through the Musafir platform. Nigerian passport holders are not eligible for the UAE tourist eVisa. Please contact your nearest embassy for alternative options.`;
  }

  const std = recommendedSkus.find(s => s.processingSpeed === "standard");
  const exp = recommendedSkus.find(s => s.processingSpeed === "express");

  const mandatoryDocs = requiredDocuments.filter(d => d.mandatory);
  const optionalDocs  = requiredDocuments.filter(d => !d.mandatory);

  const docList = mandatoryDocs.map(d => DOC_NAMES[d.docCode] ? `${DOC_NAMES[d.docCode]} (${d.notes})` : `${d.docCode} (${d.notes})`).join(", ");

  let answer = `You are eligible for the ${destName} ${ctx.travelPurpose || "tourist"} eVisa. `;

  if (intent === "documents") {
    answer = `Documents required for ${destName} ${ctx.travelPurpose || "tourist"} eVisa: ${docList}.`;
    if (optionalDocs.length > 0) {
      answer += ` Optional: ${optionalDocs.map(d => DOC_NAMES[d.docCode] || d.docCode).join(", ")}.`;
    }
    return answer;
  }

  if (intent === "pricing") {
    answer = `${destName} ${ctx.travelPurpose || "tourist"} eVisa pricing: `;
    if (std) answer += `Standard processing (${std.processingTimeDays} days) — AED ${std.finalPrice.amount}. `;
    if (exp) answer += `Express processing (${exp.processingTimeDays} day${exp.processingTimeDays > 1 ? "s" : ""}) — AED ${exp.finalPrice.amount}.`;
    return answer;
  }

  if (intent === "processing") {
    answer = `${destName} eVisa processing times: `;
    if (std) answer += `Standard — ${std.processingTimeDays} days (AED ${std.finalPrice.amount}). `;
    if (exp) answer += `Express — ${exp.processingTimeDays} day${exp.processingTimeDays > 1 ? "s" : ""} (AED ${exp.finalPrice.amount}).`;
    return answer;
  }

  // Full visa_query answer
  if (std) answer += `Standard processing takes ${std.processingTimeDays} days at AED ${std.finalPrice.amount}. `;
  if (exp) answer += `Express processing takes ${exp.processingTimeDays} day${exp.processingTimeDays > 1 ? "s" : ""} at AED ${exp.finalPrice.amount}. `;
  answer += `Required documents: ${docList}.`;
  if (optionalDocs.length > 0) {
    answer += ` Optional: ${optionalDocs.map(d => DOC_NAMES[d.docCode] || d.docCode).join(", ")}.`;
  }

  return answer;
}

// ════════════════════════════════════════════════════════════
//  RECOMMENDATION ENGINE
// ════════════════════════════════════════════════════════════

function buildRecommendations(interests, ctx) {
  const refs = [];

  // If interests provided, filter and rank by matching interests + popularity
  let candidates = [...DESTINATION];

  if (interests && interests.length > 0) {
    // Score each destination by how many interests match
    candidates = candidates
      .map(d => {
        const matchCount = interests.filter(i => d.interests.includes(i)).length;
        return {...d, matchCount};
      })
      .filter(d => d.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.popularityScore - a.popularityScore);
  } else {
    // No interests — rank by popularity
    candidates.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // Take top 5
  const top = candidates.slice(0, 5);

  top.forEach(d => refs.push({collection:"destination", id:d._id}));

  const lines = top.map(d => {
    const booking = d.hasSkusInPoc
      ? `Visa available from AED ${d.startingPrice.amount}, min ${d.minProcessingDays} days processing.`
      : `Destination available for recommendation; visa booking not available in current system.`;
    return `${d.destinationCountryName} (popularity: ${Math.round(d.popularityScore * 100)}%, interests: ${d.interests.join(", ")}) — ${booking}`;
  });

  const interestStr = interests && interests.length > 0 ? `your interests (${interests.join(", ")})` : "popularity";
  const answer = `Top destination recommendations based on ${interestStr}:\n${lines.join("\n")}`;

  return {
    answer,
    references: refs,
    eligibility: "unknown",
    recommendedSkus: [],
    requiredDocuments: []
  };
}

// ════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ════════════════════════════════════════════════════════════

function processRequest(message, context) {
  const ctx = {
    nationality:      context.nationality      || null,
    residencyCountry: context.residencyCountry || null,
    hasVisaOrPermit:  context.hasVisaOrPermit  || context.hasVisa || null,
    travelPurpose:    context.travelPurpose    || context.purpose || "tourist",
    travelGroup:      context.travelGroup      || "solo",
    stayingWithFamily:context.stayingWithFamily || false,
    interests:        context.interests        || []
  };

  const intent  = detectIntent(message);
  const destCode = detectDestination(message);

  // ── Recommendation query ─────────────────────────────────
  if (intent === "recommendation" || (!destCode && ctx.interests && ctx.interests.length > 0)) {
    return buildRecommendations(ctx.interests, ctx);
  }

  // ── Destination-specific query ───────────────────────────
  if (destCode) {
    const dest = DESTINATION.find(d => d.destinationCountryCode === destCode);

    // Destination exists but has no SKUs in POC
    if (dest && !dest.hasSkusInPoc) {
      return {
        answer: `${dest.destinationCountryName} is available as a travel destination (interests: ${dest.interests.join(", ")}, popularity: ${Math.round(dest.popularityScore * 100)}%, starting from AED ${dest.startingPrice.amount}). However, visa booking for ${dest.destinationCountryName} is not available in the current Musafir system. Please contact Musafir support for assistance.`,
        references: [{collection:"destination", id:dest._id}],
        eligibility: "unknown",
        recommendedSkus: [],
        requiredDocuments: []
      };
    }

    // Run rules engine
    const result = runRulesEngine(destCode, ctx);
    if (!result) {
      return {
        answer: "I can only answer questions based on the available visa dataset. This query is outside the scope of the current dataset.",
        references: [], eligibility: "unknown", recommendedSkus: [], requiredDocuments: []
      };
    }

    // Add knowledge source ref if available
    const ks = KNOWLEDGE_SOURCES.find(k => k.destinationCountryCode === destCode);
    if (ks) result.references.push({collection:"knowledgesources", id:ks._id, field:ks.chunkId});

    const answer = buildAnswer(destCode, ctx, result, intent);
    return {
      answer,
      references:       result.references,
      eligibility:      result.eligibility,
      recommendedSkus:  result.recommendedSkus,
      requiredDocuments:result.requiredDocuments
    };
  }

  // ── No destination detected — return refusal ─────────────
  return {
    answer: "I can only answer questions based on the available visa dataset. This query is outside the scope of the current dataset.",
    references: [], eligibility: "unknown", recommendedSkus: [], requiredDocuments: []
  };
}

// ════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════

// Primary endpoint — harness calls this
app.post("/vendor/chat", (req, res) => {
  const start = Date.now();
  try {
    const message     = req.body.message     || req.body.question || "";
    const context     = req.body.context     || req.body.userContext || {};

    console.log(`[${new Date().toISOString()}] "${message.slice(0,80)}" | ctx: ${JSON.stringify(context)}`);

    const result    = processRequest(message, context);
    const latencyMs = Date.now() - start;

    console.log(`[${new Date().toISOString()}] ${latencyMs}ms | eligibility: ${result.eligibility}`);
    res.json(result);

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      answer: "An internal error occurred.",
      references: [], eligibility: "unknown", recommendedSkus: [], requiredDocuments: []
    });
  }
});

// Alias
app.post("/chat", (req, res) => {
  req.url = "/vendor/chat";
  app._router.handle(req, res);
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok", market: "MUSAFIR_IN",
    approach: "deterministic-rules-engine",
    destinations: DESTINATION.map(d => d.destinationCountryCode),
    skuCount: VISA_SKU.length,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "Musafir Visa Chatbot API",
    approach: "Pure deterministic rules engine — no AI API required",
    endpoints: { "POST /vendor/chat": "Harness endpoint", "GET /health": "Health check" }
  });
});

// ════════════════════════════════════════════════════════════
//  START
// ════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✈  Musafir Visa API on port ${PORT} — pure rules engine, no API key needed`);
});
