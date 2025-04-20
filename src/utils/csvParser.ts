import Papa from 'papaparse';
import { FileInfo, FileType, MembershipRecord, ProcessedData } from '@/types';

// Function to determine file type based on filename
export const determineFileType = (fileName: string): FileType => {
  if (fileName.startsWith('momence-memberships-expiration-report')) {
    return 'expirations';
  }
  if (fileName.startsWith('frozen-memberships-report')) {
    return 'frozen';
  }
  if (fileName.startsWith('not-activated-memberships-report')) {
    return 'notactivated';
  }
  return 'unknown';
};

// Parse CSV file contents
export const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Clean membership name using patterns
const getCleanedMembershipName = (membershipName: string): string => {
  if (!membershipName) return "Others";
  
  const item = String(membershipName).trim();
  const patterns = [
    { pattern: /\b(Amped Up!?|Amped\s*Up)\b/i, result: "Session" },
    { pattern: /\b(powerCycle|PowerCycle(\s+Express)?)\b/i, result: "Session" },
    { pattern: /\bStudio\s+(Back Body Blaze|Barre 57|Cardio Barre|FIT|Foundations|HIIT|Mat(\s+57)?|Recovery|SWEAT|Trainer's Choice)\b/i, result: "Session" },
    { pattern: /\bVirtual\s+(Barre 57|Single Class)\b/i, result: "Session" },
    { pattern: /\bStudio\s+Single\s+[Cc]lass\.?\b/i, result: "Studio Single Class" },
    { pattern: /\b(\d+)\s*(Month|Week)\s+[Uu]nlimited\b/i, result: (match: string[], num: string, period: string) => `Studio ${num} ${period} Unlimited` },
    { pattern: /\bStudio\s+(\d+)\s+Single\s+Class\s+Pack\b/i, result: (match: string[], num: string) => `Studio ${num} Single Class Package` },
    { pattern: /\bStudio\s+(\d+)\s+Class\s+Package\b/i, result: (match: string[], num: string) => `Studio ${num} Class Package` },
    { pattern: /\bStudio\s+Private\s+Class\b/i, result: "Studio Private Class" },
    { pattern: /\bStudio\s+Private\s+Class\s+X\s+(\d+)\b/i, result: (match: string[], num: string) => `Studio Private Class X ${num}` },
    { pattern: /\bStudio\s+Annual\s+Membership\s+-\s+Monthly\s+Installment\b/i, result: "Studio Annual Unlimited - Installment" },
    { pattern: /\bStudio\s+Annual\s+Unlimited\s+Membership\b/i, result: "Studio Annual Unlimited" },
    { pattern: /\bThe\s+BURN\s+Package\b/i, result: "The Burn Package" },
    { pattern: /\bTEST\b/i, result: "Test" },
    { pattern: /\bTest\b/i, result: "Test" },
    { pattern: /\bNewcomers\s+2\s+For\s+1\b/i, result: "Studio Newcomers 2 For 1" },
    { pattern: /\bStudio\s+Extended\s+(\d+)\s+Single\s+Class\s+Pack\b/i, result: (match: string[], num: string) => `Studio ${num} Single Class Package` },
    { pattern: /\b(\w+)\b/i, result: (match: string[]) => /^[A-Z0-9]+$/.test(match[0]) ? "Other - Gift Card" : "Others" },
    { pattern: /\b(money-credit)\b/i, result: "Other - Money Credits" },
    { pattern: /\bStudio\s+Happy\s+Hour\s+Private\b/i, result: "Studio Happy Hour Private" }
  ];

  for (const { pattern, result } of patterns) {
    const match = item.match(pattern);
    if (match) {
      return typeof result === 'function' ? result(match) : result;
    }
  }

  return "Others";
};

// Generate tags based on membership record data
const generateTags = (record: MembershipRecord): string[] => {
  const tags: string[] = [];
  
  // Add tags based on membership name
  if (record.membershipName.toLowerCase().includes('annual')) {
    tags.push('annual');
  } else if (record.membershipName.toLowerCase().includes('monthly')) {
    tags.push('monthly');
  }
  
  // Add tags based on days lapsed
  if (record.daysLapsed !== undefined) {
    if (record.daysLapsed < 0) {
      tags.push('upcoming');
    } else if (record.daysLapsed === 0) {
      tags.push('today');
    } else if (record.daysLapsed <= 7) {
      tags.push('recent');
    } else if (record.daysLapsed <= 30) {
      tags.push('30-days');
    } else if (record.daysLapsed <= 90) {
      tags.push('90-days');
    } else {
      tags.push('old');
    }
  }
  
  // Add location-based tag
  if (record.homeLocation) {
    tags.push(`location:${record.homeLocation.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  return tags;
};

// Calculate days lapsed since expiration
const calculateDaysLapsed = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  // Reset time portion for accurate day calculation
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const differenceInTime = today.getTime() - expiry.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
};

// Function to standardize field names from different CSV formats
const standardizeRecords = (data: any[], fileType: FileType): MembershipRecord[] => {
  return data.map(record => {
    let customerName, customerEmail;

    if (fileType === 'expirations') {
      // For expirations file, get values by column index instead of header name
      const values = Object.values(record);
      customerName = values[0]; // First column is customer name
      customerEmail = values[1]; // Second column is customer email
    } else {
      // For other files, use header names
      customerName = record['Customer name'];
      customerEmail = record['Customer email'];
    }

    // Clean the membership name
    const rawMembershipName = record['Membership name'];
    const cleanedMembershipName = getCleanedMembershipName(rawMembershipName);

    const standardRecord: MembershipRecord = {
      customerName,
      customerEmail,
      membershipName: cleanedMembershipName,
      homeLocation: record['Home location'] || 'N/A',
    };

    // Add file type specific fields
    if (fileType === 'expirations') {
      standardRecord.expiresAt = record['Expires at'];
      
      // Calculate days lapsed if expiration date is available
      if (standardRecord.expiresAt) {
        standardRecord.daysLapsed = calculateDaysLapsed(standardRecord.expiresAt);
      }
    } else if (fileType === 'frozen') {
      standardRecord.frozenAt = record['Frozen at'];
      standardRecord.unfrozenAt = record['Unfrozen at'];
    } else if (fileType === 'notactivated') {
      standardRecord.boughtAt = record['Bought at'];
    }

    return standardRecord;
  });
};

// Check if membership name contains excluded terms
const isExcludedMembership = (membershipName: string): boolean => {
  const exclusionTerms = [
    '2 for 1', 'open barre', 'comp', 'complimentary', 'hosted', 
    'x', 'p57', 'physique', 'birthday', 'bridal', 'influencer', 
    'staff', 'family', 'free', 'referral', 'link', 'sign', 'sign-up'
  ];
  
  return exclusionTerms.some(term => 
    membershipName.toLowerCase().includes(term.toLowerCase())
  );
};

// Process all uploaded files
export const processFiles = (files: FileInfo[]): ProcessedData => {
  // Extract data by file type
  const expirationsFile = files.find(f => f.type === 'expirations');
  const frozenFile = files.find(f => f.type === 'frozen');
  const notActivatedFile = files.find(f => f.type === 'notactivated');
  
  const expirationRecords = expirationsFile?.data ? standardizeRecords(expirationsFile.data, 'expirations') : [];
  const frozenRecords = frozenFile?.data ? standardizeRecords(frozenFile.data, 'frozen') : [];
  const notActivatedRecords = notActivatedFile?.data ? standardizeRecords(notActivatedFile.data, 'notactivated') : [];

  // Extract email lists from frozen and not activated records
  const frozenEmails = new Set(frozenRecords.map(record => record.customerEmail.toLowerCase()));
  const notActivatedEmails = new Set(notActivatedRecords.map(record => record.customerEmail.toLowerCase()));

  // Filter expirations to only include the most recent record per customer
  // that doesn't match excluded terms and isn't in frozen or not activated lists
  const emailToLatestRecord: Record<string, MembershipRecord> = {};

  expirationRecords.forEach(record => {
    const email = record.customerEmail.toLowerCase();
    const currentExpiryDate = new Date(record.expiresAt || '');
    
    // Skip records with excluded membership names
    if (isExcludedMembership(record.membershipName)) {
      return;
    }
    
    // Skip records found in frozen or not activated lists
    if (frozenEmails.has(email) || notActivatedEmails.has(email)) {
      return;
    }
    
    // Keep only the latest expiration record for each customer
    if (!emailToLatestRecord[email] || 
        new Date(emailToLatestRecord[email].expiresAt || '') < currentExpiryDate) {
      emailToLatestRecord[email] = record;
    }
  });

  // Convert the filtered map back to an array and add tags
  const processedRecords = Object.values(emailToLatestRecord).map(record => {
    // Add tags to each record
    const updatedRecord = { ...record, tags: generateTags(record) };
    return updatedRecord;
  });

  // Group data in different ways for display
  const byMembershipName: Record<string, MembershipRecord[]> = {};
  const byPeriod: Record<string, MembershipRecord[]> = {};
  const byMonth: Record<string, MembershipRecord[]> = {};
  const byHomeLocation: Record<string, MembershipRecord[]> = {};

  processedRecords.forEach(record => {
    // Group by membership name
    if (!byMembershipName[record.membershipName]) {
      byMembershipName[record.membershipName] = [];
    }
    byMembershipName[record.membershipName].push(record);

    // Group by period (month-year)
    if (record.expiresAt) {
      const date = new Date(record.expiresAt);
      const period = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!byPeriod[period]) {
        byPeriod[period] = [];
      }
      byPeriod[period].push(record);
      
      // Group by month only
      const month = date.toLocaleString('default', { month: 'long' });
      if (!byMonth[month]) {
        byMonth[month] = [];
      }
      byMonth[month].push(record);
    }

    // Group by home location
    if (!byHomeLocation[record.homeLocation]) {
      byHomeLocation[record.homeLocation] = [];
    }
    byHomeLocation[record.homeLocation].push(record);
  });

  return {
    byMembershipName,
    byPeriod,
    byMonth,
    byHomeLocation,
    allRecords: processedRecords
  };
};
