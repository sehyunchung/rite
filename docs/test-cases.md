# Test Cases for DJ Event Booking System

## Overview

This document contains comprehensive test cases for the RITE DJ Event Management Platform, organized by functional areas. Each test case is written as a natural sentence to ensure clarity for both technical and non-technical team members.

## Authentication Flow

### Implemented Scenarios

- Users can sign in using Instagram OAuth through the custom proxy service
- Instagram Business/Creator accounts are validated during authentication
- Personal Instagram accounts receive an appropriate error message
- Users can sign in using Google OAuth as an alternative
- Instagram profiles are automatically connected during signup
- User sessions persist across page refreshes

### TBD Scenarios

- Apple OAuth authentication (planned but not implemented)

## Event Creation Flow

### Happy Path Scenarios

- An organizer can create a new event with basic information (venue, date, time)
- The system saves event details including venue name and address to the database
- Event deadlines for guest lists and promo materials are properly stored
- The event status defaults to "draft" when first created
- Multiple events can be created by the same organizer without conflicts

### TBD Features

- Payment information including amount per DJ (not yet implemented)
- Guest limits per DJ configuration (not yet implemented)

### Validation Scenarios

- The system prevents creating events with empty or whitespace-only names
- Future dates are required for event dates and cannot be in the past
- Venue address must contain meaningful location information
- Payment amounts must be positive numbers greater than zero
- Deadline dates must be before the actual event date
- Guest list deadlines must be before promo material deadlines

### Edge Case Scenarios

- Very long event names (over 100 characters) are handled gracefully
- Special characters in venue names and addresses are properly escaped
- Extremely large payment amounts are validated and stored correctly
- Events scheduled for leap year dates work properly
- Creating events during daylight saving time transitions works correctly

## Timeslot Management

### Core Functionality

- Organizers can add multiple DJ timeslots to an event
- Each timeslot has a start time, end time, and assigned DJ name
- Timeslots cannot overlap with each other for the same event
- Individual timeslots can be edited after creation
- Timeslots can be removed from an event
- Unique submission tokens are generated for each timeslot

### TBD Features

- DJ Instagram handle validation (currently just DJ names)
- Timeslot reordering by drag and drop (not yet implemented)

### Validation and Constraints

- Start times must be before end times for each timeslot
- DJ names cannot be empty or contain only whitespace
- Minimum timeslot duration is enforced (e.g., 30 minutes)
- Maximum number of timeslots per event is respected

### TBD Validations

- Instagram handle format validation (@username)
- Duplicate Instagram handle prevention

### Token Generation

- Each timeslot automatically generates a unique 16-character submission token
- Tokens are cryptographically secure and non-guessable
- Tokens remain consistent once generated for a timeslot
- Token collisions are prevented across all events

## DJ Info Submission Process

### Access and Authentication

- DJs can access their submission form using the unique token URL
- Invalid tokens display appropriate error messages
- Expired submission links show deadline information
- Token-based access works without requiring DJ registration
- Multiple submissions can be made before the deadline

### Form Functionality

- DJs can view their assigned event details and timeslot information
- Guest list section allows adding and removing guest entries dynamically
- Name fields are available for each guest (phone numbers TBD)
- Payment information form collects all required banking details
- Alternative "contact me directly" option works for payment preferences
- Form remembers progress if DJ navigates away and returns

### Data Collection

- Guest names support international characters and various formats
- Phone numbers accept different formats and country codes
- Bank account information is collected securely
- Resident registration numbers are handled with privacy notices
- All form data is validated before submission
- Confirmation messages appear after successful submission

## File Upload System

### Upload Functionality

- DJs can drag and drop files into the designated upload area
- Multiple files can be selected and uploaded simultaneously
- Supported file types include images (JPG, PNG), videos (MP4, MOV), and documents (PDF)
- File size limits are enforced per file and in total
- Upload progress indicators show real-time progress
- Failed uploads display clear error messages with retry options

### File Management

- Uploaded files can be previewed before final submission
- Files can be removed from the upload list before submission
- File names with special characters are handled properly
- Very large files are processed without timing out
- Duplicate file names are handled gracefully
- Files are stored securely in Convex file storage

## Payment Information Security

### Data Protection

- Sensitive payment information is encrypted before database storage
- Account numbers are masked in user interface displays
- Resident registration numbers are handled with extra security measures
- Payment data is never logged in plain text
- Encrypted data can be decrypted by authorized organizers only

### Privacy Compliance

- Clear privacy notices explain how payment data will be used
- DJs can opt for direct contact instead of providing bank details
- Data retention policies are clearly communicated
- Payment information can be updated before submission deadlines

## Validation and Error Handling

### Form Validation

- Real-time validation provides immediate feedback on field errors
- Required fields are clearly marked and cannot be skipped
- Date formats are validated and properly converted
- Email addresses follow standard validation patterns
- Error messages are clear and actionable for users

### System Error Handling

- Network failures display appropriate retry options
- Database connection issues are handled gracefully
- File upload failures provide specific error information
- Timeout scenarios display helpful guidance
- Server errors show user-friendly messages without exposing technical details

## User Experience and Interface

### Responsive Design

- Forms work correctly on mobile devices and tablets
- Touch interactions work properly for drag-and-drop functionality
- Loading states provide visual feedback during operations
- Button states prevent double-submissions during processing
- Form layout adapts to different screen sizes

### Accessibility

- Form fields have proper labels for screen readers
- Keyboard navigation works throughout all forms
- Color contrast meets accessibility standards
- Error messages are announced by assistive technologies
- Focus management works properly when adding/removing form sections

## Data Persistence and Integrity

### Database Operations

- Event creation operations are atomic and either fully succeed or fail
- Timeslot data remains consistent with parent event information
- Submission data is properly linked to correct events and timeslots
- Database relationships maintain referential integrity
- Concurrent access by multiple organizers doesn't cause data corruption

### Backup and Recovery

- Data can be recovered if submission process is interrupted
- Partial submissions are saved as drafts when possible
- System maintains audit trails of important data changes
- Database backups preserve all critical event and submission information

## Security and Access Control

### Authorization

- Only valid submission tokens grant access to DJ forms
- Organizers can only access their own events and data
- Submission tokens cannot be used to access other events
- Administrative functions require proper authentication
- Session management prevents unauthorized access

### Input Security

- All user inputs are sanitized to prevent XSS attacks
- SQL injection attempts are blocked by parameterized queries
- File uploads are scanned for malicious content
- Rate limiting prevents abuse of submission endpoints
- CSRF protection is implemented for state-changing operations

## Test Execution Notes

### Test Environment

- All tests should be executed in a controlled environment with test data
- Production data should never be used for testing purposes
- Test database should be reset between test runs for consistency
- File upload tests should use sample files of various types and sizes

### Automation Recommendations

- Critical path scenarios should be automated for regression testing
- Form validation tests are good candidates for automated testing
- File upload and security tests may require manual verification
- Performance testing should be conducted under realistic load conditions

### Success Criteria

- All happy path scenarios must pass for release readiness
- Security tests must show no vulnerabilities before deployment
- Accessibility tests must meet WCAG 2.1 AA standards
- Performance benchmarks must be met under expected user load
