/**
 * Client-side utilities for exporting guest lists in various formats
 */

// CSV Export utility
export function downloadCSV(data: { headers: string[]; rows: string[][]; filename: string }) {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', data.filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Excel Export utility (using CSV format with .xlsx extension for basic compatibility)
export function downloadExcel(data: {
  guestListSheet: { headers: string[]; data: string[][] };
  djSummarySheet: { headers: string[]; data: string[][] };
  eventSummarySheet: { headers: string[]; data: string[][] };
  filename: string;
  eventInfo: any;
}) {
  // Create a simple Excel-compatible format by combining all sheets
  const content = [
    '=== EVENT INFORMATION ===',
    `Event: ${data.eventInfo.name}`,
    `Date: ${data.eventInfo.date}`,
    `Venue: ${data.eventInfo.venue}`,
    `Total Guests: ${data.eventInfo.totalGuests}`,
    `Total DJs: ${data.eventInfo.totalDJs}`,
    `Submitted Slots: ${data.eventInfo.submittedSlots}`,
    `Pending Slots: ${data.eventInfo.pendingSlots}`,
    '',
    '=== GUEST LIST ===',
    data.guestListSheet.headers.join(','),
    ...data.guestListSheet.data.map(row => row.map(cell => `"${cell}"`).join(',')),
    '',
    '=== DJ SUMMARY ===',
    data.djSummarySheet.headers.join(','),
    ...data.djSummarySheet.data.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${data.filename}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// PDF Export utility (HTML to PDF using browser print)
export function generatePDFContent(data: {
  title: string;
  eventInfo: any;
  guestsByDJ: any[];
  summary: any;
  exportedAt: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .event-info {
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .event-info div {
          margin-bottom: 5px;
        }
        .event-info strong {
          font-weight: bold;
        }
        .dj-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .dj-header {
          background-color: #f0f0f0;
          padding: 8px;
          border: 1px solid #ddd;
          font-weight: bold;
          font-size: 14px;
        }
        .guest-list {
          border: 1px solid #ddd;
          border-top: none;
        }
        .guest-item {
          padding: 6px 8px;
          border-bottom: 1px solid #eee;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 10px;
        }
        .guest-item:last-child {
          border-bottom: none;
        }
        .no-guests {
          padding: 10px 8px;
          color: #666;
          font-style: italic;
        }
        .summary {
          margin-top: 30px;
          border-top: 2px solid #000;
          padding-top: 20px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          text-align: center;
        }
        .summary-item {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
        }
        .summary-number {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .summary-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        <p>Generated on ${new Date(data.exportedAt).toLocaleDateString()}</p>
      </div>
      
      <div class="event-info">
        <div><strong>Event:</strong> ${data.eventInfo.name}</div>
        <div><strong>Date:</strong> ${data.eventInfo.date}</div>
        <div><strong>Venue:</strong> ${data.eventInfo.venue}</div>
        <div><strong>Total Guests:</strong> ${data.eventInfo.totalGuests}</div>
      </div>
      
      ${data.guestsByDJ.map(dj => `
        <div class="dj-section">
          <div class="dj-header">
            ${dj.djName} (@${dj.djInstagram}) - ${dj.timeSlot}
            ${dj.hasSubmission ? `(${dj.guestCount} guests)` : '(Not submitted)'}
          </div>
          <div class="guest-list">
            ${dj.guests && dj.guests.length > 0 
              ? dj.guests.map((guest: any) => `
                  <div class="guest-item">
                    <div>${guest.name}</div>
                    <div>${guest.phone || 'No phone'}</div>
                  </div>
                `).join('') 
              : '<div class="no-guests">No guests submitted</div>'
            }
          </div>
        </div>
      `).join('')}
      
      <div class="summary">
        <h2>Event Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-number">${data.summary.totalDJs}</div>
            <div class="summary-label">Total DJs</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${data.summary.submittedDJs}</div>
            <div class="summary-label">Submitted</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${data.summary.pendingDJs}</div>
            <div class="summary-label">Pending</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${data.summary.totalGuests}</div>
            <div class="summary-label">Total Guests</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Generated by RITE Event Management Platform</p>
      </div>
    </body>
    </html>
  `;
}

export function downloadPDF(data: any) {
  const htmlContent = generatePDFContent(data);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Wait for content to load, then trigger print
    newWindow.onload = () => {
      setTimeout(() => {
        newWindow.print();
        // Note: User will need to manually save as PDF from print dialog
      }, 100);
    };
  }
}

// Google Sheets Export utility
export function generateGoogleSheetsURL(data: {
  guestListSheet: { headers: string[]; data: string[][] };
  eventInfo: any;
}) {
  // Create a simple CSV format that Google Sheets can import
  const csvData = [
    ['Event Information'],
    ['Event Name', data.eventInfo.name],
    ['Date', data.eventInfo.date],
    ['Venue', data.eventInfo.venue],
    ['Total Guests', data.eventInfo.totalGuests.toString()],
    [''],
    ['Guest List'],
    data.guestListSheet.headers,
    ...data.guestListSheet.data
  ];
  
  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  // Create a data URL that can be opened in Google Sheets
  const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  
  // Return instructions for manual Google Sheets import
  return {
    csvContent,
    dataUrl,
    instructions: [
      '1. Copy the CSV data below',
      '2. Go to Google Sheets (sheets.google.com)', 
      '3. Create a new spreadsheet',
      '4. Paste the data into cell A1',
      '5. Use "Data > Split text to columns" if needed'
    ]
  };
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(result);
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.resolve(false);
    }
  }
}