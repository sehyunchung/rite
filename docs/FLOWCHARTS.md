# Rite Next.js App - Current Functionality Flowcharts

## Overview

This document provides comprehensive flowcharts for the current Next.js application functionality, including user flows, authentication patterns, data management, and system architecture.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[rite/ui Components]
        C[Dynamic Theme System]
        D[i18n Support]
    end

    subgraph "Authentication Layer"
        E[NextAuth v5]
        F[Instagram OAuth Proxy]
        G[Google OAuth]
        H[Session Management]
    end

    subgraph "Backend Layer"
        I[Convex Database]
        J[Convex File Storage]
        K[Real-time Subscriptions]
        L[Server Actions]
    end

    subgraph "External Services"
        M[Instagram API]
        N[Cloudflare Worker Proxy]
        O[Vercel Deployment]
    end

    A --> E
    E --> F
    E --> G
    F --> N
    N --> M
    A --> I
    I --> J
    I --> K
    A --> B
    B --> C
    A --> D
    O --> A

    style A fill:#E946FF,color:#fff
    style I fill:#E946FF,color:#fff
    style E fill:#4CAF50,color:#fff
```

---

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js App
    participant NA as NextAuth v5
    participant CP as Cloudflare Proxy
    participant IG as Instagram API
    participant GO as Google OAuth
    participant CV as Convex DB

    U->>N: Visit App
    N->>N: Check Session
    alt No Session
        N->>U: Redirect to /auth/signin
        U->>NA: Choose OAuth Provider

        alt Instagram OAuth
            NA->>CP: Initiate OAuth Flow
            CP->>IG: Transform to OIDC
            IG-->>CP: Authorization Code
            CP-->>NA: OIDC Response
        else Google OAuth
            NA->>GO: Standard OAuth Flow
            GO-->>NA: Authorization Response
        end

        NA->>CV: Create/Update User
        CV-->>NA: User Data
        NA->>N: Session Created
        N->>U: Redirect to Dashboard
    else Has Session
        N->>U: Show Dashboard
    end
```

---

## 3. Event Creation Flow

```mermaid
flowchart TD
    A[User Clicks Create Event] --> B{Authenticated?}
    B -->|No| C[Redirect to /auth/signin]
    B -->|Yes| D[Show Event Creation Form]

    D --> E[Fill Event Details]
    E --> F[Add Timeslots]
    F --> G[Assign DJs to Timeslots]
    G --> H[Set Deadlines & Payment]
    H --> I[Validate Form Data]

    I -->|Invalid| J[Show Validation Errors]
    J --> E

    I -->|Valid| K[Submit to Convex]
    K --> L[Generate Submission Tokens]
    L --> M[Create Event Record]
    M --> N[Generate Submission Links]
    N --> O[Show Success Message]
    O --> P[Copy Individual DJ Messages]
    P --> Q[Redirect to Event Detail]

    style A fill:#E946FF,color:#fff
    style K fill:#4CAF50,color:#fff
    style O fill:#4CAF50,color:#fff
```

---

## 4. DJ Submission Flow (No Authentication Required)

```mermaid
flowchart TD
    A[DJ Receives Link] --> B[Click Submission Link]
    B --> C[Extract Token from URL]
    C --> D{Valid Token?}

    D -->|No| E[Show Invalid Token Error]
    D -->|Yes| F[Load Submission Form]

    F --> G[Show Event Details]
    G --> H[Show DJ Timeslot Info]
    H --> I[Multi-Step Form]

    I --> J[Step 1: Promo Materials]
    J --> K[File Upload + Description]
    K --> L[Step 2: Guest List]
    L --> M[Dynamic Guest Name Fields]
    M --> N[Step 3: Payment Info]
    N --> O[Bank Details + Encryption]

    O --> P[Review All Information]
    P --> Q{Validate Complete?}

    Q -->|No| R[Show Missing Fields]
    R --> I

    Q -->|Yes| S[Submit to Convex]
    S --> T[Store Files in Convex Storage]
    T --> U[Encrypt Sensitive Data]
    U --> V[Update Submission Record]
    V --> W[Show Success Message]
    W --> X[Allow Future Edits Until Deadline]

    style A fill:#E946FF,color:#fff
    style S fill:#4CAF50,color:#fff
    style W fill:#4CAF50,color:#fff
```

---

## 5. Dashboard Overview Flow

```mermaid
flowchart TD
    A[User Accesses Dashboard] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Data]

    D --> E[Fetch User Events]
    E --> F[Display Event Cards]
    F --> G[Show Event Status]
    G --> H[Calculate Submission Progress]

    H --> I[Actions Available]
    I --> J[Create New Event]
    I --> K[View Event Details]
    I --> L[Edit Event]
    I --> M[View Submissions]
    I --> N[Generate Content]

    J --> O[Event Creation Flow]
    K --> P[Event Detail View]
    L --> Q{Event Phase Check}
    Q -->|Can Edit| R[Event Edit Form]
    Q -->|Cannot Edit| S[Read-Only View]

    M --> T[Submissions Dashboard]
    N --> U[Instagram Post Generation]

    style A fill:#E946FF,color:#fff
    style I fill:#4CAF50,color:#fff
```

---

## 6. Event Status & Phase Management

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Event
    Draft --> Planning: Publish Event
    Planning --> Finalized: Finalize Details
    Finalized --> DayOf: Event Day Starts
    DayOf --> Completed: Event Ends

    Draft --> Cancelled: Cancel Event
    Planning --> Cancelled: Cancel Event
    Finalized --> Cancelled: Cancel Event

    state Draft {
        [*] --> CanEdit
        CanEdit --> CanPublish
    }

    state Planning {
        [*] --> AcceptingSubmissions
        AcceptingSubmissions --> CanGenerateContent
    }

    state Finalized {
        [*] --> ReadOnly
        ReadOnly --> ShowUrgentBanner
    }

    state DayOf {
        [*] --> DayOfFeatures
        DayOfFeatures --> LiveUpdates
    }

    state Completed {
        [*] --> ArchiveReady
    }

    note right of Draft: • Can edit all details\n• Can add/remove timeslots\n• Generate submission links
    note right of Planning: • Accept DJ submissions\n• Generate promo content\n• Send reminders
    note right of Finalized: • Read-only mode\n• Show urgent banners\n• Final preparations
    note right of DayOf: • Day-of features active\n• Real-time updates\n• Live coordination
```

---

## 7. Theme System Architecture

```mermaid
flowchart LR
    A[Theme Configuration] --> B[rite/ui Tokens]
    B --> C[CSS Variables Generation]
    C --> D[Theme Switcher Component]

    D --> E[localStorage Persistence]
    D --> F[Real-time CSS Updates]

    F --> G[Component Re-rendering]
    E --> H[Theme Restoration on Load]

    I[Available Themes] --> J[Josh Comeau Dark]
    I --> K[Josh Comeau Light]

    J --> L[Dark Theme Tokens]
    K --> M[Light Theme Tokens]

    L --> C
    M --> C

    subgraph "Theme Features"
        N[Dynamic Switching]
        O[Cross-Platform Support]
        P[Design System Integration]
        Q[Automatic Text Adaptation]
    end

    D --> N
    B --> O
    B --> P
    C --> Q

    style I fill:#E946FF,color:#fff
    style D fill:#4CAF50,color:#fff
```

---

## 8. Internationalization Flow

```mermaid
flowchart TD
    A[User Visits App] --> B[Detect/Extract Locale]
    B --> C{Locale in URL?}

    C -->|Yes| D[Use URL Locale]
    C -->|No| E[Use Browser Default]
    E --> F[Redirect to /locale/path]

    D --> G[Load Locale Messages]
    G --> H[Initialize next-intl]
    H --> I[Render Localized Content]

    I --> J[Language Switcher Available]
    J --> K{User Changes Language?}
    K -->|Yes| L[Update URL Locale]
    L --> M[Reload with New Locale]
    M --> G

    K -->|No| N[Continue with Current Locale]

    O[Supported Locales] --> P[Korean - ko]
    O --> Q[English - en]

    P --> G
    Q --> G

    style A fill:#E946FF,color:#fff
    style J fill:#4CAF50,color:#fff
```

---

## 9. File Upload & Storage Flow

```mermaid
sequenceDiagram
    participant DJ as DJ
    participant UI as Upload Component
    participant CV as Convex Storage
    participant DB as Convex DB

    DJ->>UI: Select Files
    UI->>UI: Validate File Types/Size
    UI->>CV: Upload to Convex Storage
    CV-->>UI: Return File IDs

    UI->>UI: Store File References
    DJ->>UI: Add Description
    DJ->>UI: Submit Form

    UI->>DB: Create Submission Record
    Note over DB: Files linked by ID
    DB-->>UI: Submission Saved
    UI->>DJ: Show Success

    Note over CV: Files auto-cleanup after event
    Note over DB: Sensitive data encrypted
```

---

## 10. Instagram Integration Architecture (Planned)

```mermaid
flowchart TD
    A[Event Created] --> B[Generate Content Option]
    B --> C{User Has Instagram Connection?}

    C -->|No| D[OAuth Connection Flow]
    D --> E[Cloudflare Worker Proxy]
    E --> F[Instagram Business API]
    F --> G[Store Encrypted Tokens]

    C -->|Yes| H[Select Template Type]
    H --> I[Announcement Template]
    H --> J[Lineup Template]
    H --> K[Countdown Template]

    I --> L[Generate with Event Data]
    J --> L
    K --> L

    L --> M[Apply rite/ui Theme]
    M --> N[Render with SUIT Font]
    N --> O[Generate 1080x1080 Image]

    O --> P[Store in Convex Storage]
    P --> Q[Generate Caption & Hashtags]
    Q --> R[Preview for User]

    R --> S{User Approves?}
    S -->|No| T[Edit Template]
    T --> L

    S -->|Yes| U[Download Option]
    S -->|Yes| V[Schedule Post Option]

    V --> W[Premium Feature Check]
    W --> X[Queue for Publishing]
    X --> Y[Cron Job Processing]
    Y --> Z[Post to Instagram]

    style A fill:#E946FF,color:#fff
    style L fill:#4CAF50,color:#fff
    style Z fill:#4CAF50,color:#fff
```

---

## 11. Mobile App Integration (Expo)

```mermaid
flowchart TD
    A[Mobile App Launch] --> B[Check Authentication]
    B --> C{Has Session?}

    C -->|No| D[Show Auth Options]
    D --> E[Google OAuth]
    D --> F[Instagram OAuth]

    E --> G[Cross-Platform OAuth]
    F --> H[OAuth Proxy Integration]

    G --> I[Store Secure Tokens]
    H --> I

    C -->|Yes| J[Load Dashboard]
    I --> J

    J --> K[Sync with Convex Backend]
    K --> L[Real-time Updates]
    L --> M[Display Events]

    M --> N[Native Components]
    N --> O[rite/ui Mobile Components]
    O --> P[Platform-Specific Styling]

    Q[Mobile Features] --> R[Camera Integration]
    Q --> S[Push Notifications]
    Q --> T[Offline Support]
    Q --> U[Native Navigation]

    style A fill:#E946FF,color:#fff
    style J fill:#4CAF50,color:#fff
```

---

## 12. Data Security & Privacy Flow

```mermaid
flowchart TD
    A[Sensitive Data Input] --> B{Data Type?}

    B -->|Payment Info| C[Client-Side Validation]
    B -->|Personal Data| D[GDPR Compliance Check]
    B -->|Auth Tokens| E[OAuth Token Handling]

    C --> F[Encrypt Before Storage]
    D --> G[User Consent Tracking]
    E --> H[Secure Token Storage]

    F --> I[Convex Encrypted Fields]
    G --> J[Privacy Policy Display]
    H --> K[Automatic Token Refresh]

    I --> L[Database Storage]
    J --> M[User Rights Management]
    K --> N[Session Management]

    L --> O[Access Control]
    M --> P[Data Export/Delete Options]
    N --> Q[Token Expiry Handling]

    O --> R[Audit Logging]
    P --> S[GDPR Compliance]
    Q --> T[Re-authentication Flow]

    style A fill:#E946FF,color:#fff
    style S fill:#4CAF50,color:#fff
```

---

## Summary

The current Rite Next.js application implements a comprehensive event management system with the following key features:

### ✅ **Implemented Features**

- **Authentication**: NextAuth v5 with Instagram/Google OAuth
- **Event Management**: Full CRUD with phase-based status system
- **DJ Submissions**: Token-based, no-auth required submissions
- **File Handling**: Convex storage with automatic cleanup
- **Theme System**: Dynamic switching with CSS variables
- **Internationalization**: Korean/English support with next-intl
- **Mobile Support**: Expo app with shared backend
- **Security**: Encrypted sensitive data, GDPR compliance

### 🚧 **In Progress**

- **Instagram Integration**: Post generation templates
- **File Upload Enhancements**: Better validation and preview

### 📋 **Planned Features**

- **Instagram Publishing**: Automated posting for premium users
- **Advanced Analytics**: Event and submission insights
- **Email Notifications**: Automated reminders and updates
- **Advanced Mobile Features**: Push notifications, offline support

The architecture prioritizes **simplicity**, **reliability**, and **maintainability** while serving the Korean DJ community with culturally appropriate design and functionality.
