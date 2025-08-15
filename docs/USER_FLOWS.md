# RITE User Flows

This document outlines the key user flows in the RITE platform using Mermaid flowchart diagrams.

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Event Creation Flow](#event-creation-flow)
3. [DJ Submission Flow](#dj-submission-flow)
4. [Dashboard Overview Flow](#dashboard-overview-flow)
5. [Premium Upgrade Flow](#premium-upgrade-flow)

---

## Authentication Flow

```mermaid
flowchart TD
    Start([User Visits RITE]) --> Landing[Landing Page]
    Landing --> SignIn{User Signed In?}

    SignIn -->|Yes| Dashboard[Dashboard]
    SignIn -->|No| AuthPage[Auth Page]

    AuthPage --> AuthMethod{Choose Auth Method}
    AuthMethod -->|Instagram| InstagramOAuth[Instagram OAuth]
    AuthMethod -->|Google| GoogleOAuth[Google OAuth]
    AuthMethod -->|Apple - TBD| AppleOAuth[Apple OAuth - TBD]

    InstagramOAuth --> InstagramProxy[OAuth Proxy Service]
    InstagramProxy --> ValidateAccount{Business/Creator Account?}
    ValidateAccount -->|No| ErrorMsg[Error: Business/Creator Account Required]
    ValidateAccount -->|Yes| FetchProfile[Fetch Instagram Profile]

    FetchProfile --> SaveToConvex[Save User to Convex]
    GoogleOAuth --> SaveToConvex
    AppleOAuth -.-> SaveToConvex

    SaveToConvex --> AutoConnect{Instagram User?}
    AutoConnect -->|Yes| SaveConnection[Save Instagram Connection]
    AutoConnect -->|No| Dashboard
    SaveConnection --> Dashboard

    ErrorMsg --> AuthPage

    style InstagramProxy fill:#ff6b6b
    style SaveToConvex fill:#4ecdc4
    style Dashboard fill:#95e1d3
    style AppleOAuth fill:#e0e0e0
```

---

## Event Creation Flow

```mermaid
flowchart TD
    Start([Organizer at Dashboard]) --> CreateButton[Click 'Create Event']
    CreateButton --> EventForm[Event Creation Form]

    EventForm --> BasicInfo[Enter Basic Info]
    BasicInfo --> |Venue, Date, Time| Validation1{Valid?}
    Validation1 -->|No| BasicInfo
    Validation1 -->|Yes| Timeslots[Add DJ Timeslots]

    Timeslots --> AddSlot{Add Timeslot?}
    AddSlot -->|Yes| SlotDetails[Enter Slot Details]
    SlotDetails --> |Time, DJ Name| CheckOverlap{Time Overlap?}
    CheckOverlap -->|Yes| SlotError[Error: Time Overlap]
    CheckOverlap -->|No| GenerateToken[Generate Unique Token]

    GenerateToken --> SlotAdded[Timeslot Added]
    SlotAdded --> MoreSlots{More Slots?}
    MoreSlots -->|Yes| AddSlot
    MoreSlots -->|No| ReviewEvent[Review Event]

    SlotError --> SlotDetails

    ReviewEvent --> SubmitEvent[Submit Event]
    SubmitEvent --> SaveConvex[Save to Convex Database]
    SaveConvex --> GenerateLinks[Generate Submission Links]
    GenerateLinks --> ShowSuccess[Show Success + Links]
    ShowSuccess --> EventDashboard[Event Dashboard]

    style EventForm fill:#ffd93d
    style SaveConvex fill:#4ecdc4
    style EventDashboard fill:#95e1d3
```

---

## DJ Info Submission Flow

```mermaid
flowchart TD
    Start([DJ Receives Link]) --> ClickLink[Click Submission Link]
    ClickLink --> ParseToken{Valid Token?}

    ParseToken -->|No| Error404[404 Error Page]
    ParseToken -->|Yes| LoadEvent[Load Event & Timeslot Info]

    LoadEvent --> CheckDeadline{Past Deadline?}
    CheckDeadline -->|Yes| DeadlineError[Error: Submission Closed]
    CheckDeadline -->|No| SubmissionForm[DJ Info Submission Form]

    SubmissionForm --> ShowEventInfo[Display Event Info]
    ShowEventInfo --> EnterGuests[Enter Guest List]

    EnterGuests --> AddGuest{Add Guest?}
    AddGuest -->|Yes| GuestName[Guest Name Only]
    GuestName --> GuestAdded[Guest Added]
    GuestAdded --> MoreGuests{More Guests?}
    MoreGuests -->|Yes| AddGuest
    MoreGuests -->|No| PaymentInfo[Enter Payment Info]

    PaymentInfo --> BankDetails[Bank Account Details]
    BankDetails --> PromoFiles[Upload Promo Materials]

    PromoFiles --> Dropzone[Dropzone Component]
    Dropzone --> ValidateFiles{Valid Files?}
    ValidateFiles -->|No| FileError[Error: Invalid File Type]
    ValidateFiles -->|Yes| FilesUploaded[Files Uploaded to Convex]

    FileError --> Dropzone
    FilesUploaded --> ReviewSubmission[Review Submission]
    ReviewSubmission --> Submit[Submit]

    Submit --> SaveSubmission[Save to Convex]
    SaveSubmission --> Confirmation[Show Confirmation]
    Confirmation --> Complete[Submission Complete]

    style SubmissionForm fill:#ffd93d
    style SaveSubmission fill:#4ecdc4
    style Complete fill:#95e1d3
```

---

## Dashboard Overview Flow

```mermaid
flowchart TD
    Start([User Logged In]) --> Dashboard[Dashboard]
    Dashboard --> LoadData[Load User Data]

    LoadData --> FetchEvents[Fetch User's Events]
    LoadData --> FetchProfile[Fetch User Profile]
    LoadData --> CheckInstagram[Check Instagram Connection]

    FetchEvents --> EventsList[Display Events List]
    FetchProfile --> UserInfo[Display User Info]
    CheckInstagram --> InstagramStatus{Connected?}

    InstagramStatus -->|Yes| ShowHandle[Show @username]
    InstagramStatus -->|No| ShowEmail[Show Email/Name]

    EventsList --> EventCard[Event Cards]
    EventCard --> EventActions{User Action?}

    EventActions -->|View| EventDetails[Event Details Page]
    EventActions -->|Track| SubmissionTracker[Submission Tracker]
    EventActions -->|Share| GenerateLinks[Generate/Copy Links]
    EventActions -->|Create New| CreateEvent[Create Event Flow]

    EventDetails --> ViewSubmissions[View DJ Submissions]
    ViewSubmissions --> SubmissionStatus[Submission Status]

    SubmissionTracker --> RealTimeUpdates[Real-time Updates]
    RealTimeUpdates --> NotifyOrganizer[Notify on New Submission]

    style Dashboard fill:#95e1d3
    style EventsList fill:#ffd93d
    style RealTimeUpdates fill:#4ecdc4
```

---

## Premium Upgrade Flow

```mermaid
flowchart TD
    Start([Free User]) --> EventComplete{Event Completed?}
    EventComplete -->|No| ContinueFree[Continue Using Free]
    EventComplete -->|Yes| DataExpiry[Data Expires Notification]

    DataExpiry --> UpgradePrompt[Show Upgrade Benefits]
    UpgradePrompt --> Benefits[["Save Event History<br/>Reuse Templates<br/>Export Data<br/>₩15,000/month"]]

    Benefits --> Decision{Upgrade?}
    Decision -->|No| DataDeleted[Event Data Deleted]
    Decision -->|Yes| PaymentPage[Payment Page]

    PaymentPage --> PayMethod{Payment Method}
    PayMethod -->|KakaoPay| KakaoFlow[KakaoPay Integration]
    PayMethod -->|Toss| TossFlow[Toss Integration]
    PayMethod -->|Card| CardFlow[Card Payment]

    KakaoFlow --> ProcessPayment[Process Payment]
    TossFlow --> ProcessPayment
    CardFlow --> ProcessPayment

    ProcessPayment --> PaymentSuccess{Success?}
    PaymentSuccess -->|No| PaymentError[Show Error]
    PaymentSuccess -->|Yes| UpgradeAccount[Upgrade Account]

    PaymentError --> PaymentPage
    UpgradeAccount --> EnableFeatures[Enable Premium Features]
    EnableFeatures --> SaveHistory[Save Event History]
    SaveHistory --> PremiumDashboard[Premium Dashboard]

    PremiumDashboard --> TemplateLibrary[Access Template Library]
    PremiumDashboard --> ExportData[Export Past Events]
    PremiumDashboard --> Analytics[View Analytics]

    style UpgradePrompt fill:#ff6b6b
    style ProcessPayment fill:#ffd93d
    style PremiumDashboard fill:#95e1d3
```

---

## Language Switching Flow

```mermaid
flowchart TD
    Start([User on Any Page]) --> LangButton[Click Language Switcher]
    LangButton --> ShowDropdown[Show Language Dropdown]

    ShowDropdown --> CurrentLang{Current Language}
    CurrentLang -->|English| ShowKorean[Show Korean Option 🇰🇷]
    CurrentLang -->|Korean| ShowEnglish[Show English Option 🇺🇸]

    ShowKorean --> SelectKorean[Select Korean]
    ShowEnglish --> SelectEnglish[Select English]

    SelectKorean --> UpdateRoute[Update Route with /ko/]
    SelectEnglish --> UpdateRoute2[Update Route with /en/]

    UpdateRoute --> LoadTranslations[Load Korean Translations]
    UpdateRoute2 --> LoadTranslations2[Load English Translations]

    LoadTranslations --> RefreshPage[Refresh with Korean UI]
    LoadTranslations2 --> RefreshPage2[Refresh with English UI]

    RefreshPage --> Complete[UI in Korean]
    RefreshPage2 --> Complete2[UI in English]

    style LangButton fill:#ffd93d
    style UpdateRoute fill:#4ecdc4
    style Complete fill:#95e1d3
```

---

## Mobile App Flow (Future)

```mermaid
flowchart TD
    Start([Open Mobile App]) --> SplashScreen[Splash Screen]
    SplashScreen --> CheckAuth{Authenticated?}

    CheckAuth -->|No| OnboardingFlow[Onboarding Screens]
    CheckAuth -->|Yes| MainApp[Main App]

    OnboardingFlow --> AuthOptions[Show Auth Options]
    AuthOptions --> MobileAuth{Auth Method}

    MobileAuth -->|Magic Link| EmailInput[Enter Email]
    MobileAuth -->|Social| SocialAuth[Social OAuth]

    EmailInput --> SendLink[Send Magic Link]
    SendLink --> CheckEmail[Check Email Notification]
    CheckEmail --> ClickLink[User Clicks Link]
    ClickLink --> Authenticated[Authenticated]

    SocialAuth --> OAuthFlow[OAuth Flow]
    OAuthFlow --> Authenticated

    Authenticated --> MainApp

    MainApp --> TabNav[Tab Navigation]
    TabNav --> EventsTab[Events Tab]
    TabNav --> ProfileTab[Profile Tab]
    TabNav --> SettingsTab[Settings Tab]

    EventsTab --> EventList[Event List]
    EventList --> EventDetail[Event Details]
    EventDetail --> SubmissionForm[Submit as DJ]

    style SplashScreen fill:#ff6b6b
    style MainApp fill:#4ecdc4
    style TabNav fill:#95e1d3
```

---

## Notes

- **Real-time Updates**: All flows leverage Convex's real-time capabilities for instant data synchronization
- **Error Handling**: Each flow includes validation and error states to ensure data integrity
- **Internationalization**: All user-facing elements support Korean/English language switching
- **Mobile Optimization**: Web flows are responsive and work on mobile browsers
- **Security**: Token-based access for DJ submissions, OAuth for authentication
- **Progressive Enhancement**: Free users get full functionality, premium adds convenience features
