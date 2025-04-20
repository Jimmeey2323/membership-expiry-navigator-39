
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

    const standardRecord: MembershipRecord = {
      customerName,
      customerEmail,
      membershipName: record['Membership name'],
      homeLocation: record['Home location'] || 'N/A',
    };

    // Add file type specific fields
    if (fileType === 'expirations') {
      standardRecord.expiresAt = record['Expires at'];
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

  // Convert the filtered map back to an array
  const processedRecords = Object.values(emailToLatestRecord);

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
