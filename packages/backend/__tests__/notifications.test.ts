/**
 * Tests for the email notification system
 * Note: These are unit tests for the email template and validation logic.
 * Integration tests with Convex would require a test environment setup.
 */

import { emailTemplates, type NotificationContext, type EmailTemplate } from '../convex/notifications';

describe('Email Templates', () => {
  const mockContext: NotificationContext = {
    djName: 'DJ Test',
    eventName: 'Summer Party 2024',
    eventDate: '2024-07-15',
    venue: 'Test Club, 123 Main St, Seoul',
    organizerName: 'Event Organizer',
    organizerEmail: 'organizer@test.com',
    timeslot: '22:00 - 01:00',
    submissionLink: 'https://rite.party/submission/123',
    eventDetailsLink: 'https://rite.party/event/456'
  };

  describe('submissionReceived template', () => {
    let template: EmailTemplate;

    beforeEach(() => {
      template = emailTemplates.submissionReceived(mockContext);
    });

    test('generates proper subject line', () => {
      expect(template.subject).toContain('Summer Party 2024');
      expect(template.subject).toContain('Submission received');
    });

    test('includes DJ name in content', () => {
      expect(template.htmlContent).toContain('DJ Test');
      expect(template.textContent).toContain('DJ Test');
    });

    test('includes event details in content', () => {
      expect(template.htmlContent).toContain('Summer Party 2024');
      expect(template.htmlContent).toContain('2024-07-15');
      expect(template.htmlContent).toContain('Test Club');
      expect(template.htmlContent).toContain('22:00 - 01:00');
      
      expect(template.textContent).toContain('Summer Party 2024');
      expect(template.textContent).toContain('2024-07-15');
      expect(template.textContent).toContain('Test Club');
    });

    test('includes organizer information', () => {
      expect(template.htmlContent).toContain('Event Organizer');
      expect(template.textContent).toContain('Event Organizer');
    });

    test('includes RITE branding', () => {
      expect(template.htmlContent).toContain('rite.party');
      expect(template.htmlContent).toContain('#E946FF');
      expect(template.textContent).toContain('https://rite.party');
    });

    test('has proper HTML structure', () => {
      expect(template.htmlContent).toContain('<div');
      expect(template.htmlContent).toContain('</div>');
      expect(template.htmlContent).toContain('<h2');
      expect(template.htmlContent).toContain('<p');
    });
  });

  describe('submissionAccepted template', () => {
    let template: EmailTemplate;

    beforeEach(() => {
      template = emailTemplates.submissionAccepted(mockContext);
    });

    test('generates congratulatory subject', () => {
      expect(template.subject).toContain('Congratulations');
      expect(template.subject).toContain('selected');
      expect(template.subject).toContain('Summer Party 2024');
    });

    test('includes performance details', () => {
      expect(template.htmlContent).toContain('Your Performance Details');
      expect(template.htmlContent).toContain('22:00 - 01:00');
      expect(template.htmlContent).toContain('2024-07-15');
    });

    test('includes next steps', () => {
      expect(template.htmlContent).toContain('Next Steps');
      expect(template.htmlContent).toContain('Confirm your attendance');
      expect(template.htmlContent).toContain('sound check');
      expect(template.textContent).toContain('Next Steps');
    });

    test('has encouraging tone', () => {
      expect(template.htmlContent).toContain('Congratulations');
      expect(template.htmlContent).toContain('rock the dance floor');
      expect(template.textContent).toContain('Great news');
    });

    test('uses gradient styling for performance details', () => {
      expect(template.htmlContent).toContain('linear-gradient');
      expect(template.htmlContent).toContain('#E946FF');
      expect(template.htmlContent).toContain('#9333EA');
    });
  });

  describe('submissionRejected template', () => {
    let template: EmailTemplate;

    beforeEach(() => {
      template = emailTemplates.submissionRejected(mockContext);
    });

    test('uses tactful subject line', () => {
      expect(template.subject).toContain('Update on your submission');
      expect(template.subject).toContain('Summer Party 2024');
      expect(template.subject).not.toContain('rejected');
      expect(template.subject).not.toContain('declined');
    });

    test('provides encouraging message', () => {
      expect(template.htmlContent).toContain('not reflect on your talent');
      expect(template.htmlContent).toContain('Keep creating and performing');
      expect(template.textContent).toContain('your music matters');
    });

    test('explains decision factors', () => {
      expect(template.htmlContent).toContain('timing, musical style fit');
      expect(template.textContent).toContain('timing, musical style fit');
    });

    test('suggests future opportunities', () => {
      expect(template.htmlContent).toContain('Follow RITE for future');
      expect(template.htmlContent).toContain('Connect with other organizers');
    });

    test('maintains professional tone', () => {
      expect(template.htmlContent).toContain('Thank you for your interest');
      expect(template.htmlContent).toContain('Best regards');
      expect(template.textContent).toContain('Thank you again');
    });
  });

  describe('eventReminder template', () => {
    let template: EmailTemplate;

    beforeEach(() => {
      template = emailTemplates.eventReminder(mockContext);
    });

    test('creates urgent reminder subject', () => {
      expect(template.subject).toContain('Reminder');
      expect(template.subject).toContain('tonight');
      expect(template.subject).toContain('Summer Party 2024');
    });

    test('includes pre-show checklist', () => {
      expect(template.htmlContent).toContain('Pre-Show Checklist');
      expect(template.htmlContent).toContain('Arrive 30 minutes early');
      expect(template.htmlContent).toContain('headphones');
      expect(template.htmlContent).toContain('USB/laptop backup');
      expect(template.textContent).toContain('sound check');
    });

    test('provides organizer contact info', () => {
      expect(template.htmlContent).toContain('organizer@test.com');
      expect(template.textContent).toContain('organizer@test.com');
    });

    test('has motivational tone', () => {
      expect(template.htmlContent).toContain('Break a leg');
      expect(template.htmlContent).toContain('love your set');
      expect(template.textContent).toContain('Big Night Tonight');
    });
  });

  describe('Template consistency', () => {
    const templates = [
      emailTemplates.submissionReceived(mockContext),
      emailTemplates.submissionAccepted(mockContext),
      emailTemplates.submissionRejected(mockContext),
      emailTemplates.eventReminder(mockContext)
    ];

    test('all templates have required properties', () => {
      templates.forEach(template => {
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('htmlContent');
        expect(template).toHaveProperty('textContent');
        expect(typeof template.subject).toBe('string');
        expect(typeof template.htmlContent).toBe('string');
        expect(typeof template.textContent).toBe('string');
      });
    });

    test('all templates include RITE branding', () => {
      templates.forEach(template => {
        expect(template.htmlContent).toContain('rite.party');
        expect(template.textContent).toContain('rite.party');
      });
    });

    test('all templates include primary brand color', () => {
      templates.forEach(template => {
        expect(template.htmlContent).toContain('#E946FF');
      });
    });

    test('HTML content is well-formed', () => {
      templates.forEach(template => {
        // Should have proper div structure
        expect(template.htmlContent).toContain('<div');
        expect(template.htmlContent).toContain('</div>');
        
        // Should use proper font family
        expect(template.htmlContent).toContain('font-family');
        expect(template.htmlContent).toContain('-apple-system');
        
        // Should have max-width for email client compatibility
        expect(template.htmlContent).toContain('max-width: 600px');
      });
    });

    test('text content mirrors HTML content', () => {
      templates.forEach(template => {
        // Both should contain the DJ name
        expect(template.htmlContent).toContain(mockContext.djName);
        expect(template.textContent).toContain(mockContext.djName);
        
        // Both should contain the event name
        expect(template.htmlContent).toContain(mockContext.eventName);
        expect(template.textContent).toContain(mockContext.eventName);
        
        // Text content should not have HTML tags
        expect(template.textContent).not.toContain('<div');
        expect(template.textContent).not.toContain('</div>');
      });
    });
  });

  describe('Context handling', () => {
    test('handles missing optional context fields gracefully', () => {
      const minimalContext: NotificationContext = {
        djName: 'DJ Test',
        eventName: 'Test Event',
        eventDate: '2024-07-15',
        venue: 'Test Venue',
        organizerName: 'Organizer',
        organizerEmail: 'test@test.com',
        timeslot: '20:00 - 22:00'
      };

      const template = emailTemplates.submissionReceived(minimalContext);
      expect(template.subject).toBeTruthy();
      expect(template.htmlContent).toBeTruthy();
      expect(template.textContent).toBeTruthy();
    });

    test('handles special characters in context', () => {
      const specialContext: NotificationContext = {
        djName: 'DJ Test & Friends',
        eventName: 'Summer "Party" 2024 <Special>',
        eventDate: '2024-07-15',
        venue: 'Test & Co. Club, 123 Main St',
        organizerName: 'Event Organizer <Test>',
        organizerEmail: 'organizer@test.com',
        timeslot: '22:00 - 01:00'
      };

      const template = emailTemplates.submissionReceived(specialContext);
      expect(template.htmlContent).toContain('DJ Test &amp; Friends');
      expect(template.htmlContent).toContain('Summer &quot;Party&quot;');
      expect(template.textContent).toContain('DJ Test & Friends');
      expect(template.textContent).toContain('Summer "Party"');
    });

    test('handles long text content appropriately', () => {
      const longContext: NotificationContext = {
        djName: 'DJ with a very long stage name that might wrap',
        eventName: 'Summer Music Festival 2024 - Electronic Dance Music Extravaganza',
        eventDate: '2024-07-15',
        venue: 'The Very Long Venue Name and Address, 123456 Very Long Street Name, District, Seoul, South Korea',
        organizerName: 'Event Organization Company with Long Name',
        organizerEmail: 'very.long.organizer.email@organization.company.com',
        timeslot: '22:00 - 01:00'
      };

      const template = emailTemplates.submissionReceived(longContext);
      expect(template.subject.length).toBeLessThan(200); // Reasonable subject length
      expect(template.htmlContent).toBeTruthy();
      expect(template.textContent).toBeTruthy();
    });
  });
});