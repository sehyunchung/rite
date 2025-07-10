# DJ Event Booking System - Product Requirements Document

## Overview

A web application that streamlines the booking and administration process for local DJ events by centralizing communication, file sharing, and data collection while integrating with existing Instagram-based workflows.

## Tech Stack

- **Backend**: Convex
- **Frontend**: React (Vite), Tailwind CSS
- **Authentication**: Simple magic link or OAuth (organizer only)
- **Storage**: Convex file storage for uploads
- **Security**: Encrypted storage for sensitive payment information

## Core User Flows

### 1. Organizer Flow

#### 1.1 Authentication

- Simple auth for organizers only (magic link email or Google OAuth)
- No authentication required for DJs

#### 1.2 Event Creation

**Input Fields:**

- Event name
- Date & time
- Venue name & address
- Event description (optional)
- Instagram hashtags
- Payment amount per DJ
- Guest limit per DJ
- Deadlines:
  - Guest list submission deadline
  - Promo material deadline
  - Payment info deadline

**Timeslot Builder:**

- Default slots (e.g., 22:00-23:00, 23:00-00:00)
- Drag to reorder
- Click to edit times
- Add/remove slots
- Assign DJ to each slot by Instagram handle

**Templates:**

- Save event as template for recurring events
- Load from previous events

#### 1.3 Content Generation

**Instagram Message Generator:**

```
🎵 [Event Name] - [Date formatted in Korean]
📍 [Venue]

LINEUP:
[Time] - @[instagram_handle]
[...]

📝 각 디제이별 제출 링크는 DM으로 전송됩니다
⏰ 마감일:
- 게스트 명단: [date]
- 프로모 자료: [date]

[Custom hashtags]
```

**Individual DJ Messages:**
For each DJ, generate copyable text:

```
안녕하세요! [Event Name] 관련 정보입니다:

🔗 제출 링크: [unique-submission-link]
⏰ 공연 시간: [slot time]
👥 게스트: [limit]명까지
💰 공연료: [amount]원
📅 마감일:
- 게스트 명단: [date]
- 프로모 자료: [date]
- 계좌 정보: [date]

링크에서 모든 정보를 제출해주세요!
```

#### 1.4 Dashboard

**Overview Section:**

- Event name, date, status
- Progress bars for submissions
- Quick stats (X/Y DJs submitted)

**Submission Tracker Table:**
| DJ | Instagram | Slot | Guest List | Promo | Payment | Actions |
|---|---|---|---|---|---|---|
| Name | @handle | 23:00 | ✅ 2/2 | ✅ | ⏳ | Send Reminder |

**Actions:**

- Copy individual reminder message
- View submission details
- Mark as complete manually
- Edit DJ slot

**Bulk Actions:**

- Send reminders to all pending
- Export guest list (CSV)
- Export payment info (encrypted CSV)
- Download all promo materials (zip)

### 2. DJ Flow

#### 2.1 Submission Page (No Auth Required)

Access via unique link: `app.com/submit/[unique-id]`

**Page Layout:**

- Event header (name, date, venue)
- DJ's specific info (name, slot time, requirements)
- Submission form

**Form Sections:**

1. **Promo Materials**

   - Drag & drop zone
   - Accepted: images (jpg, png), videos (mp4, mov), documents (pdf)
   - Max file size: 50MB per file
   - Text description field (Instagram caption ready)
   - Preview uploaded files

2. **Guest List**

   - Dynamic form: "Number of guests" dropdown (0 to limit)
   - Name fields appear based on selection
   - Optional: phone number per guest

3. **Payment Information**
   - Account holder name
   - Bank name (dropdown)
   - Account number
   - Resident registration number (주민번호) - encrypted field
   - Alternative: "Contact me directly" checkbox

**Submission:**

- Review screen before final submit
- Success page with confirmation
- "Edit Submission" link (until deadline)

## Success Metrics

1. Time to create event < 5 minutes
2. DJ submission completion rate > 90%
3. Reduction in follow-up messages by 70%
4. All information collected before deadline

## Development Notes

### Convex Considerations

- Use Convex file storage for promo materials
- Implement custom encryption for sensitive fields
- Real-time updates for organizer dashboard
- Efficient query patterns for submission tracking

### Security

- Rate limiting on submission endpoints
- File upload validation (type, size)
- XSS prevention in text fields
- Secure unique link generation

---

This PRD defines the MVP scope for the DJ event booking system. The focus is on solving immediate pain points while maintaining the Instagram-centric workflow that users are comfortable with.