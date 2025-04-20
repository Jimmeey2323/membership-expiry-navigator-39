
import { MembershipRecord, ExportFormat } from '@/types';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
// This import is for the typings, the actual import is done as a plugin via CDN
import 'jspdf-autotable';

// Type augmentation for jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportData = (
  records: MembershipRecord[],
  format: ExportFormat,
  fileName: string = 'membership-expiry-data'
): void => {
  switch (format) {
    case 'csv':
      exportAsCSV(records, fileName);
      break;
    case 'excel':
      exportAsExcel(records, fileName);
      break;
    case 'pdf':
      exportAsPDF(records, fileName);
      break;
    case 'json':
      exportAsJSON(records, fileName);
      break;
    default:
      console.error('Unsupported export format');
  }
};

const convertToSimpleObjects = (records: MembershipRecord[]): Record<string, string>[] => {
  return records.map(record => {
    const expiresAtDate = record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : '';
    
    return {
      'Customer Name': record.customerName,
      'Email': record.customerEmail,
      'Membership': record.membershipName,
      'Location': record.homeLocation,
      'Expires At': expiresAtDate,
      'Days Lapsed': record.daysLapsed?.toString() || '',
      'Tags': record.tags?.join(', ') || '',
      'Assigned To': record.assignedTo || '',
      'Follow-ups': record.followUps?.length.toString() || '0',
    };
  });
};

const exportAsCSV = (records: MembershipRecord[], fileName: string): void => {
  const simpleRecords = convertToSimpleObjects(records);
  
  // Get headers from first record
  const headers = Object.keys(simpleRecords[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  simpleRecords.forEach(record => {
    const row = headers.map(header => {
      const value = record[header] || '';
      // Escape quotes and wrap in quotes if needed
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csvContent += row.join(',') + '\n';
  });
  
  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

const exportAsExcel = (records: MembershipRecord[], fileName: string): void => {
  const simpleRecords = convertToSimpleObjects(records);
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(simpleRecords);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Membership Data');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

const exportAsPDF = (records: MembershipRecord[], fileName: string): void => {
  const simpleRecords = convertToSimpleObjects(records);
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.text('Membership Expiration Report', 14, 15);
  
  // Add current date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
  
  // Prepare data for autoTable
  const headers = Object.keys(simpleRecords[0]);
  const data = simpleRecords.map(record => headers.map(header => record[header]));
  
  // Add table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 30,
    margin: { top: 30 },
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] }
  });
  
  // Save PDF
  doc.save(`${fileName}.pdf`);
};

const exportAsJSON = (records: MembershipRecord[], fileName: string): void => {
  // Create JSON string
  const jsonString = JSON.stringify(records, null, 2);
  
  // Create Blob and download
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `${fileName}.json`);
};
