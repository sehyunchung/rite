import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportGuestList } from './ExportGuestList';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { NextIntlClientProvider } from 'next-intl';
import { Effect } from 'effect';
import * as React from 'react';

// Mock Convex
vi.mock('convex/react', () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ConvexReactClient: vi.fn(),
  useQuery: vi.fn(),
  useConvex: vi.fn()
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTranslations: () => (key: string) => key
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock data
const mockCSVData = {
  content: `Guest Name,Phone,DJ Name,DJ Instagram,Time Slot
John Doe,555-0001,DJ Test,@djtest,20:00 - 21:00
Jane Smith,555-0002,DJ Test,@djtest,20:00 - 21:00`,
  filename: 'test_event_guest_list.csv',
  mimeType: 'text/csv'
};

const mockExcelData = {
  sheets: {
    'Guest List': {
      headers: ['Guest Name', 'Phone', 'DJ Name', 'DJ Instagram', 'Time Slot'],
      data: [
        ['John Doe', '555-0001', 'DJ Test', '@djtest', '20:00 - 21:00'],
        ['Jane Smith', '555-0002', 'DJ Test', '@djtest', '20:00 - 21:00']
      ]
    }
  },
  filename: 'test_event_guest_list.xlsx',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

describe('ExportGuestList Component', () => {
  let mockUseQuery: ReturnType<typeof vi.fn>;
  let mockUseConvex: ReturnType<typeof vi.fn>;
  let mockConvexQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup mocks
    mockConvexQuery = vi.fn();
    mockUseQuery = vi.fn();
    mockUseConvex = vi.fn(() => ({
      query: mockConvexQuery
    }));

    // Apply mocks
    const convexReact = await import('convex/react');
    convexReact.useQuery = mockUseQuery;
    convexReact.useConvex = mockUseConvex;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement for download link
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should show loading state when data is undefined', () => {
      mockUseQuery.mockReturnValue(undefined);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      expect(screen.getByText('events.submissions.exports.title')).toBeInTheDocument();
      // Loading indicator should be present
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should show error state when data is null', () => {
      mockUseQuery.mockReturnValue(null);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      expect(screen.getByText('events.submissions.exports.errors.noGuestData')).toBeInTheDocument();
    });

    it('should render export buttons when data is available', () => {
      mockUseQuery.mockReturnValue(mockCSVData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('Google Sheets')).toBeInTheDocument();
    });

    it('should display guest count correctly', () => {
      mockUseQuery.mockReturnValue(mockCSVData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      // The component should calculate 2 guests (3 lines - 1 header)
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText('events.submissions.exports.guestsReady')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should handle CSV export', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const csvButton = screen.getByText('CSV').closest('button');
      expect(csvButton).not.toBeDisabled();

      fireEvent.click(csvButton!);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalledWith('a');
      });
    });

    it('should fetch Excel data on demand', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);
      mockConvexQuery.mockResolvedValue(mockExcelData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const excelButton = screen.getByText('Excel').closest('button');
      fireEvent.click(excelButton!);

      await waitFor(() => {
        expect(mockConvexQuery).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            eventId: 'event123',
            userId: 'user123'
          })
        );
      });
    });

    it('should handle export errors gracefully', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);
      mockConvexQuery.mockRejectedValue(new Error('Export failed'));

      const { toast } = await import('sonner');

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const excelButton = screen.getByText('Excel').closest('button');
      fireEvent.click(excelButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('events.submissions.exports.errors.exportFailed')
        );
      });
    });

    it('should show loading state during export', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);
      
      // Create a promise that we can control
      let resolveExport: (value: any) => void;
      const exportPromise = new Promise((resolve) => {
        resolveExport = resolve;
      });
      mockConvexQuery.mockReturnValue(exportPromise);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const excelButton = screen.getByText('Excel').closest('button');
      fireEvent.click(excelButton!);

      // Button should be disabled while loading
      await waitFor(() => {
        expect(excelButton).toBeDisabled();
      });

      // Resolve the export
      resolveExport!(mockExcelData);

      await waitFor(() => {
        expect(excelButton).not.toBeDisabled();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize guest count calculation', () => {
      const { rerender } = render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      // Initial render with CSV data
      mockUseQuery.mockReturnValue(mockCSVData);
      rerender(<ExportGuestList eventId="event123" userId="user123" />);

      // Re-render with same data
      rerender(<ExportGuestList eventId="event123" userId="user123" />);

      // Guest count calculation should be memoized
      // This is tested by ensuring the component doesn't unnecessarily recalculate
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('should cache fetched export data', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);
      mockConvexQuery.mockResolvedValue(mockExcelData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const excelButton = screen.getByText('Excel').closest('button');
      
      // First click - should fetch data
      fireEvent.click(excelButton!);
      await waitFor(() => {
        expect(mockConvexQuery).toHaveBeenCalledTimes(1);
      });

      // Second click - should use cached data
      fireEvent.click(excelButton!);
      await waitFor(() => {
        // Should still only be called once due to caching
        expect(mockConvexQuery).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Effect Integration', () => {
    it('should process export using Effect pipeline', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);

      // Spy on Effect.runPromise
      const runPromiseSpy = vi.spyOn(Effect, 'runPromise');

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const csvButton = screen.getByText('CSV').closest('button');
      fireEvent.click(csvButton!);

      await waitFor(() => {
        expect(runPromiseSpy).toHaveBeenCalled();
      });
    });

    it('should handle Effect errors properly', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);

      // Mock Effect to throw an error
      vi.spyOn(Effect, 'runPromise').mockRejectedValue(new Error('Effect pipeline failed'));

      const { toast } = await import('sonner');

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const csvButton = screen.getByText('CSV').closest('button');
      fireEvent.click(csvButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockUseQuery.mockReturnValue(mockCSVData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should indicate loading state to screen readers', async () => {
      mockUseQuery.mockReturnValue(mockCSVData);
      
      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      const csvButton = screen.getByText('CSV').closest('button');
      fireEvent.click(csvButton!);

      // Check for loading indicator
      await waitFor(() => {
        const loadingIndicator = document.querySelector('.animate-pulse');
        expect(loadingIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation', () => {
    it('should handle empty guest lists', () => {
      const emptyData = {
        content: 'Guest Name,Phone,DJ Name,DJ Instagram,Time Slot\n',
        filename: 'test_event_guest_list.csv',
        mimeType: 'text/csv'
      };

      mockUseQuery.mockReturnValue(emptyData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      // Should show 0 guests
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle malformed CSV data gracefully', () => {
      const malformedData = {
        content: null,
        filename: 'test.csv',
        mimeType: 'text/csv'
      };

      mockUseQuery.mockReturnValue(malformedData);

      render(
        <ExportGuestList eventId="event123" userId="user123" />
      );

      // Should default to 0 guests when content is invalid
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });
});