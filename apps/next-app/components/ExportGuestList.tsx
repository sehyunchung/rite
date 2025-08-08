'use client';

import * as React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from '@rite/ui';
import { useTranslations } from 'next-intl';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  downloadCSV, 
  downloadExcel, 
  downloadPDF, 
  generateGoogleSheetsURL, 
  copyToClipboard 
} from '@/lib/export-utils';
import { toast } from 'sonner';

interface ExportGuestListProps {
  eventId: string;
  eventName: string;
}

export function ExportGuestList({ eventId, eventName }: ExportGuestListProps) {
  const t = useTranslations('events.export');
  const [isExporting, setIsExporting] = React.useState<string | null>(null);
  const [googleSheetsData, setGoogleSheetsData] = React.useState<any>(null);

  // Queries for different export formats
  const csvData = useQuery(api.exports.getEventGuestListCSV, { 
    eventId: eventId as Id<"events"> 
  });
  const spreadsheetData = useQuery(api.exports.getEventGuestListSpreadsheet, { 
    eventId: eventId as Id<"events"> 
  });
  const pdfData = useQuery(api.exports.getEventGuestListPDF, { 
    eventId: eventId as Id<"events"> 
  });

  const handleCSVExport = async () => {
    if (!csvData) return;
    
    try {
      setIsExporting('csv');
      downloadCSV(csvData);
      toast.success(t('success.csv') || 'CSV file downloaded successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error(t('error.csv') || 'Failed to export CSV file');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExcelExport = async () => {
    if (!spreadsheetData) return;
    
    try {
      setIsExporting('excel');
      downloadExcel(spreadsheetData);
      toast.success(t('success.excel') || 'Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(t('error.excel') || 'Failed to export Excel file');
    } finally {
      setIsExporting(null);
    }
  };

  const handlePDFExport = async () => {
    if (!pdfData) return;
    
    try {
      setIsExporting('pdf');
      downloadPDF(pdfData);
      toast.success(t('success.pdf') || 'PDF opened for download');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('error.pdf') || 'Failed to export PDF file');
    } finally {
      setIsExporting(null);
    }
  };

  const handleGoogleSheetsExport = async () => {
    if (!spreadsheetData) return;
    
    try {
      setIsExporting('sheets');
      const sheetsData = generateGoogleSheetsURL(spreadsheetData);
      
      // Copy CSV data to clipboard
      const success = await copyToClipboard(sheetsData.csvContent);
      
      if (success) {
        toast.success('Google Sheets data copied to clipboard! Go to Google Sheets and paste it.');
        // Open Google Sheets in new tab
        window.open('https://sheets.google.com', '_blank');
      } else {
        toast.error(t('error.sheets') || 'Failed to prepare Google Sheets data');
      }
    } catch (error) {
      console.error('Google Sheets export error:', error);
      toast.error(t('error.sheets') || 'Failed to prepare Google Sheets data');
    } finally {
      setIsExporting(null);
    }
  };


  // Show loading state while data is loading
  if (csvData === undefined || spreadsheetData === undefined || pdfData === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading export options...</span>
        </CardContent>
      </Card>
    );
  }

  // Show message if no guest data is available
  const hasGuestData = csvData?.rows.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>{t('title') || 'Export Guest List'}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('description') || 'Download your event guest list in various formats'}
          </p>
        </CardHeader>
        <CardContent>
          {!hasGuestData ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {t('noGuests') || 'No guest submissions yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('noGuestsHint') || 'Guest lists will appear here after DJs submit their information'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{csvData?.eventInfo.totalGuests || 0} total guests</span>
                  <span>•</span>
                  <span>{csvData?.eventInfo.totalDJs || 0} DJs</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CSV Export */}
                <Button
                  onClick={handleCSVExport}
                  disabled={isExporting === 'csv'}
                  className="flex items-center justify-center space-x-2 h-12"
                  variant="outline"
                >
                  {isExporting === 'csv' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{t('csv') || 'Download CSV'}</span>
                </Button>

                {/* Excel Export */}
                <Button
                  onClick={handleExcelExport}
                  disabled={isExporting === 'excel'}
                  className="flex items-center justify-center space-x-2 h-12"
                  variant="outline"
                >
                  {isExporting === 'excel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  <span>{t('excel') || 'Download Excel'}</span>
                </Button>

                {/* PDF Export */}
                <Button
                  onClick={handlePDFExport}
                  disabled={isExporting === 'pdf'}
                  className="flex items-center justify-center space-x-2 h-12"
                  variant="outline"
                >
                  {isExporting === 'pdf' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{t('pdf') || 'Export PDF'}</span>
                </Button>

                {/* Google Sheets Export */}
                <Button
                  onClick={handleGoogleSheetsExport}
                  disabled={isExporting === 'sheets'}
                  className="flex items-center justify-center space-x-2 h-12"
                  variant="outline"
                >
                  {isExporting === 'sheets' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span>{t('sheets') || 'Google Sheets'}</span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}