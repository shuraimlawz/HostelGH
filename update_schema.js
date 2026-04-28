const fs = require('fs');

const path = 'c:/Users/issak/Desktop/HostelGH/prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// 1. Remove Enums
schema = schema.replace(/enum PayoutMethodType \{[\s\S]*?\}/, '');
schema = schema.replace(/enum HostelListingFeeModel \{[\s\S]*?\}/, '');
schema = schema.replace(/enum DisputeRaisedBy \{[\s\S]*?\}/, '');
schema = schema.replace(/enum DisputeStatus \{[\s\S]*?\}/, '');
schema = schema.replace(/enum PayoutStatus \{[\s\S]*?\}/, '');

// 2. Remove Models
const modelsToRemove = [
  'SavedPaymentMethod',
  'PayoutMethod',
  'Wallet',
  'PayoutRequest',
  'ListingFeaturePayment',
  'InstallmentPlan',
  'Dispute',
  'SettlementAccount'
];

for (const model of modelsToRemove) {
  const regex = new RegExp(`model ${model} \\{[\\s\\S]*?\\}`, 'g');
  schema = schema.replace(regex, '');
}

// 3. Clean User relations
schema = schema.replace(/payoutMethods PayoutMethod\[\]/g, '');
schema = schema.replace(/savedPaymentMethods SavedPaymentMethod\[\]/g, '');
schema = schema.replace(/wallets\s+Wallet\[\]/g, '');
schema = schema.replace(/payoutRequests PayoutRequest\[\]/g, '');
schema = schema.replace(/processedPayouts PayoutRequest\[\] @relation\("PayoutProcessor"\)/g, '');
schema = schema.replace(/listingFeaturePayments ListingFeaturePayment\[\]/g, '');
schema = schema.replace(/paystackSubaccountCode String\? \/\/ For automated split payments/g, '');
schema = schema.replace(/settlementAccount\s+SettlementAccount\?/g, '');

// 4. Update Hostel
schema = schema.replace(/\/\/ Listing fee model and configuration[\s\S]*?perAcceptanceFee\s+Int\?\s*\/\/[^\n]*\n/, '');
schema = schema.replace(/listingFeaturePayments ListingFeaturePayment\[\]/g, '');

// Add isArchived
schema = schema.replace(/isPublished\s+Boolean\s+@default\(false\)/, 'isPublished          Boolean  @default(false)\n  isArchived           Boolean  @default(false)');

// 5. Update Booking
schema = schema.replace(/\/\/ Escrow & Check-in[\s\S]*?payoutAmount\s+Int\?\s*\/\/[^\n]*\n/, '');
schema = schema.replace(/installmentPlans InstallmentPlan\[\]/g, '');
schema = schema.replace(/disputes Dispute\[\]/g, '');

// 6. Update Payment
schema = schema.replace(/processingFee Int\? @default\(0\)\n\s+platformFee\s+Int @default\(0\)\n\s+ownerEarnings Int @default\(0\)/, '');

// Save the file
fs.writeFileSync(path, schema);
console.log('Schema updated');
