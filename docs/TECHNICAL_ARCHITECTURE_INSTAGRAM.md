# Technical Architecture: Instagram Post Generation
## Simple System Design for Korean DJ Friends

---

## 🏗️ **System Overview**

The Instagram post generation feature for Rite is a straightforward addition that helps Korean DJ organizers create decent-looking social media content. The architecture is designed for **simplicity**, **reliability**, and **maintenance ease** while handling modest usage from 50-100 Korean electronic music organizers.

### High-Level Architecture (Simplified)

```
┌─────────────────────────────────────────────────────┐
│                 Rite Frontend                      │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Event Dashboard │  │ Generate Post   │         │
│  │                 │  │                 │         │
│  │ • Event Setup   │  │ • Template Pick │         │
│  │ • DJ Timeslots  │  │ • Preview/Edit  │         │
│  │ • Basic Info    │  │ • Download      │         │
│  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                Convex Backend                      │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Content Engine  │  │ Simple Scheduler│         │
│  │                 │  │ (Premium Only)  │         │
│  │ • Template Render│  │ • Basic Queue   │         │
│  │ • Image Creation│  │ • Korean Time   │         │
│  │ • Korean Text   │  │ • Retry Logic   │         │
│  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│              External Services                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Instagram API   │  │ Convex Storage  │         │
│  │                 │  │                 │         │
│  │ • OAuth Connect │  │ • Image Files   │         │
│  │ • Post Content  │  │ • CDN Delivery  │         │
│  │ • Basic Insights│  │ • Simple Cache  │         │
│  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **Core Components (Simplified)**

### 1. Content Engine
**Purpose**: Generate simple Instagram posts from event data

**Responsibilities:**
- Render 3 basic templates with event information
- Generate 1080x1080 JPEG images
- Create Korean captions with appropriate hashtags
- Handle Korean typography properly

**Technologies:**
- **Canvas API** for image generation (server-side)
- **Pretendard font** for Korean text rendering
- **Simple templates** - no complex AI or dynamic generation

**API Interface:**
```typescript
interface ContentEngine {
  generatePost(eventId: Id<"events">, templateType: TemplateType): Promise<GeneratedPost>
}

interface GeneratedPost {
  imageUrl: string
  caption: string
  hashtags: string[]
  downloadUrl: string
}

type TemplateType = "announcement" | "lineup" | "countdown"
```

### 2. Simple Scheduler (Premium Feature)
**Purpose**: Basic posting automation for premium users

**Responsibilities:**
- Queue posts for future publication (Korean timezone)
- Simple retry logic for failed posts
- Instagram API rate limiting compliance

**Technologies:**
- **Convex Cron Jobs** for scheduled execution
- **Basic retry with exponential backoff**
- **Korean timezone handling (KST)**

**Data Models:**
```typescript
interface ScheduledPost {
  _id: Id<"scheduled_posts">
  eventId: Id<"events">
  userId: Id<"users">
  templateType: TemplateType
  scheduledTime: string // KST timezone
  status: "pending" | "published" | "failed"
  retryCount: number
  instagramPostId?: string
  error?: string
  createdAt: string
}
```

### 3. Instagram API Integration (Basic)
**Purpose**: Simple Instagram posting for premium users

**Responsibilities:**
- OAuth token management for Korean users
- Basic post publishing
- Simple error handling

**Implementation:**
```typescript
class InstagramAPIClient {
  async publishPost(
    accessToken: string,
    imageUrl: string,
    caption: string
  ): Promise<{ id: string }> {
    // 1. Create media container
    const container = await this.createMediaContainer({
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken
    })
    
    // 2. Publish container
    const result = await this.publishContainer({
      creation_id: container.id,
      access_token: accessToken
    })
    
    return { id: result.id }
  }
}
```

### 4. Template System (3 Basic Templates)
**Purpose**: Create decent-looking posts for Korean electronic music events

**Templates:**
```
Templates/
├── announcement.ts    # Basic event announcement
├── lineup.ts         # DJ lineup display
└── countdown.ts      # Days until event
```

**Template Engine:**
```typescript
interface Template {
  id: TemplateType
  name: string
  generate(event: Event): Promise<Buffer>
}

class TemplateRenderer {
  async renderAnnouncement(event: Event): Promise<Buffer> {
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext('2d')
    
    // Korean font setup
    registerFont('./assets/fonts/Pretendard-Regular.ttf', { family: 'Pretendard' })
    
    // Dark background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, 1080, 1080)
    
    // Event name (Korean + English)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 64px Pretendard'
    ctx.textAlign = 'center'
    ctx.fillText(event.name, 540, 300)
    
    // Date and venue
    ctx.font = '32px Pretendard'
    ctx.fillText(event.date, 540, 400)
    ctx.fillText(event.venue.name, 540, 450)
    
    return canvas.toBuffer('image/jpeg', { quality: 0.9 })
  }
}
```

---

## 📊 **Data Models (Simple)**

### Core Entities

**Generated Posts:**
```typescript
interface GeneratedPost {
  _id: Id<"generated_posts">
  eventId: Id<"events">
  userId: Id<"users">
  templateType: TemplateType
  imageId: Id<"_storage">
  caption: string
  hashtags: string[]
  generatedAt: string
  downloaded: boolean
  published: boolean
}
```

**Instagram Connections (Premium):**
```typescript
interface InstagramConnection {
  _id: Id<"instagram_connections">
  userId: Id<"users">
  instagramUserId: string
  username: string
  accessToken: string // Encrypted
  tokenExpiresAt: string
  connectedAt: string
  isActive: boolean
}
```

### Simple Database Schema
```sql
Users (1) → (N) GeneratedPosts
Users (1) → (1) InstagramConnection  
Events (1) → (N) GeneratedPosts
GeneratedPosts (1) → (0..1) ScheduledPosts
```

---

## ⚡ **Job Processing (Basic)**

### Simple Queue System

**Job Types:**
- `PUBLISH_POST` - Post to Instagram (premium only)
- `CLEANUP_OLD_IMAGES` - Remove old generated images

**Processing:**
```typescript
export const publishScheduledPost = action({
  args: { postId: v.id("scheduled_posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)
    if (!post || post.status !== "pending") return
    
    try {
      const connection = await ctx.db
        .query("instagram_connections")
        .filter((q) => q.eq(q.field("userId"), post.userId))
        .first()
      
      if (!connection) throw new Error("No Instagram connection")
      
      const generatedPost = await ctx.db.get(post.generatedPostId)
      const imageUrl = await ctx.storage.getUrl(generatedPost.imageId)
      
      // Publish to Instagram
      const instagram = new InstagramAPIClient()
      const result = await instagram.publishPost(
        connection.accessToken,
        imageUrl,
        generatedPost.caption
      )
      
      // Update status
      await ctx.db.patch(post._id, {
        status: "published",
        instagramPostId: result.id,
        publishedAt: new Date().toISOString()
      })
      
    } catch (error) {
      await ctx.db.patch(post._id, {
        status: "failed",
        error: error.message,
        retryCount: post.retryCount + 1
      })
      
      // Retry if under limit
      if (post.retryCount < 3) {
        await ctx.scheduler.runAfter(
          60000 * Math.pow(2, post.retryCount), // Exponential backoff
          "publishScheduledPost",
          { postId: post._id }
        )
      }
    }
  }
})
```

### Cron Jobs (Minimal)
```typescript
export const processScheduledPosts = cronJobs.interval(
  "process posts",
  { minutes: 5 }, // Check every 5 minutes
  async (ctx) => {
    const now = new Date()
    const pendingPosts = await ctx.db
      .query("scheduled_posts")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "pending"),
          q.lte(q.field("scheduledTime"), now.toISOString())
        )
      )
      .collect()
      
    for (const post of pendingPosts) {
      await ctx.scheduler.runAfter(0, "publishScheduledPost", { 
        postId: post._id 
      })
    }
  }
)

export const cleanupOldImages = cronJobs.interval(
  "cleanup images",
  { days: 1 }, // Daily cleanup
  async (ctx) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const oldPosts = await ctx.db
      .query("generated_posts")
      .filter((q) => 
        q.and(
          q.lt(q.field("generatedAt"), oneWeekAgo.toISOString()),
          q.eq(q.field("downloaded"), true)
        )
      )
      .collect()
      
    for (const post of oldPosts) {
      await ctx.storage.delete(post.imageId)
      await ctx.db.delete(post._id)
    }
  }
)
```

---

## 🔒 **Security (Basic Requirements)**

### Instagram API Security
**Token Management:**
- Encrypt access tokens with Convex's built-in encryption
- Store tokens securely in database
- Handle token refresh for long-lived tokens

**Rate Limiting:**
```typescript
class SimpleRateLimiter {
  private readonly limits = {
    posts: 25, // 25 posts per day per user (well below Instagram limits)
    generation: 100 // 100 generations per day per user
  }
  
  async checkLimit(userId: Id<"users">, operation: 'post' | 'generation'): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]
    const key = `${userId}:${operation}:${today}`
    
    const count = await this.redis.get(key) || 0
    return count < this.limits[operation]
  }
  
  async recordUsage(userId: Id<"users">, operation: 'post' | 'generation'): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const key = `${userId}:${operation}:${today}`
    
    await this.redis.incr(key)
    await this.redis.expire(key, 86400) // 24 hours
  }
}
```

### Data Protection (GDPR Compliance)
```typescript
export const deleteUserData = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delete Instagram connection
    const connection = await ctx.db
      .query("instagram_connections")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first()
    if (connection) await ctx.db.delete(connection._id)
    
    // Delete generated posts and images
    const posts = await ctx.db
      .query("generated_posts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect()
    
    for (const post of posts) {
      await ctx.storage.delete(post.imageId)
      await ctx.db.delete(post._id)
    }
    
    // Delete scheduled posts
    const scheduledPosts = await ctx.db
      .query("scheduled_posts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect()
    
    for (const scheduled of scheduledPosts) {
      await ctx.db.delete(scheduled._id)
    }
  }
})
```

---

## 🛠 **Development Approach (Simple)**

### Technology Stack (Already Available)
- **Frontend**: React + TypeScript (existing Rite codebase)
- **Backend**: Convex (already set up and working)
- **Image Generation**: Canvas API (Node.js built-in)
- **File Storage**: Convex File Storage (already available)
- **Authentication**: Clerk (already integrated)

### Code Organization (Minimal)
```
src/
├── components/
│   └── instagram/
│       ├── PostGenerator.tsx      # Main generation component
│       ├── TemplateSelector.tsx   # Choose from 3 templates
│       └── InstagramConnect.tsx   # Premium OAuth setup
├── lib/
│   ├── instagram/
│   │   ├── api-client.ts         # Simple Instagram API
│   │   └── templates.ts          # 3 template generators
│   └── validation/
│       └── instagram.ts          # Input validation
└── convex/
    ├── instagram/
    │   ├── generate.ts           # Post generation functions
    │   ├── schedule.ts           # Basic scheduling (premium)
    │   └── connect.ts            # Instagram OAuth
    └── storage/
        └── cleanup.ts            # Image cleanup jobs
```

### Testing Strategy (Minimal)
**Manual Testing:**
- Test 3 templates with real Korean event data
- Verify Korean text rendering
- Test Instagram OAuth flow
- Verify image download functionality

**Basic Automated Tests:**
- Template generation produces valid images
- Korean text renders correctly
- Instagram API integration works
- Rate limiting functions correctly

---

## 📊 **Performance Requirements (Modest)**

### Simple Performance Targets
- **Template Generation**: < 5 seconds for any template
- **Image Download**: < 3 seconds for 1080x1080 JPEG
- **Instagram Posting**: < 15 seconds from queue to published
- **System Response**: < 2 seconds for UI interactions

### Scaling Considerations (50-100 Users)
```typescript
// Simple performance monitoring
export const trackPerformance = action({
  args: { operation: v.string(), duration: v.number() },
  handler: async (ctx, args) => {
    // Only track if duration is unusually high
    if (args.duration > 5000) { // 5 seconds
      await ctx.db.insert("performance_logs", {
        operation: args.operation,
        duration: args.duration,
        timestamp: new Date().toISOString()
      })
    }
  }
})
```

### Resource Usage (Conservative)
- **Storage**: ~1MB per generated image, cleanup after 7 days
- **Bandwidth**: Modest - 50-100 users, maybe 10-20 posts per day total
- **Compute**: Canvas generation is light, Instagram API calls are minimal
- **Database**: Simple schema, low query volume

---

## 📈 **Monitoring (Basic)**

### Simple Health Checks
```typescript
export const healthCheck = query({
  handler: async (ctx) => {
    const checks = {
      database: true, // Convex handles this
      storage: await ctx.storage !== undefined,
      timestamp: new Date().toISOString()
    }
    
    return checks
  }
})

// Daily usage summary for Korean timezone
export const dailyUsageSummary = cronJobs.interval(
  "daily summary",
  { hours: 24 }, // Once per day
  async (ctx) => {
    const today = new Date().toISOString().split('T')[0]
    
    const generatedToday = await ctx.db
      .query("generated_posts")
      .filter((q) => q.gte(q.field("generatedAt"), today))
      .collect()
    
    const publishedToday = await ctx.db
      .query("scheduled_posts")
      .filter((q) => 
        q.and(
          q.gte(q.field("publishedAt"), today),
          q.eq(q.field("status"), "published")
        )
      )
      .collect()
    
    // Simple logging - no complex analytics needed
    console.log(`Daily Summary ${today}:`, {
      generated: generatedToday.length,
      published: publishedToday.length,
      activeUsers: new Set(generatedToday.map(p => p.userId)).size
    })
  }
)
```

---

## 🚀 **Deployment (Simple)**

### Infrastructure (Already Available)
- **Frontend**: Existing Vercel deployment
- **Backend**: Existing Convex deployment
- **File Storage**: Convex File Storage with CDN
- **Monitoring**: Convex built-in monitoring

### Simple Configuration
```typescript
// Environment variables (minimal)
const config = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI
  },
  features: {
    premiumScheduling: true,
    maxGenerationsPerDay: {
      free: 2,
      premium: 100
    }
  }
}
```

### Simple Deployment Process
1. **Development**: Test with Korean friends using real event data
2. **Staging**: Deploy to existing Convex staging environment
3. **Production**: Use existing Convex production deployment
4. **Rollback**: Convex handles automatic rollback if issues occur

---

## 🎯 **Success Metrics (Simple)**

### Technical Metrics
- **Template Generation Success Rate**: > 95%
- **Instagram Posting Success Rate**: > 90% (premium users)
- **Korean Text Rendering Quality**: Manual review with Korean users
- **System Uptime**: > 99% (via Convex)

### Usage Metrics
- **Posts Generated per Day**: Track for resource planning
- **Posts Actually Downloaded**: Measure actual usage vs generation
- **Posts Published to Instagram**: Measure premium feature adoption
- **User Satisfaction**: Direct feedback from Korean DJ friends

---

## 🎉 **Conclusion: Simple & Effective**

This technical architecture focuses on **simplicity over sophistication**, designed to:

✅ **Generate decent-looking posts** for Korean electronic music events  
✅ **Handle 50-100 users reliably** without complex scaling concerns  
✅ **Integrate with existing Rite infrastructure** using proven technologies  
✅ **Provide basic automation** for premium users who want convenience

**What This Is:**
- A straightforward Canvas-based image generation system
- Simple Instagram API integration for premium posting
- Basic templates optimized for Korean electronic music aesthetic
- Minimal complexity with reliable performance

**What This Is Not:**
- An enterprise-scale marketing automation platform
- A complex AI-powered content generation system
- A multi-platform social media management tool
- A sophisticated analytics and optimization platform

**Implementation Approach:**
- Start with 3 basic templates and manual download
- Add Instagram posting for premium users if demand exists
- Focus on Korean typography and cultural aesthetics
- Keep complexity minimal while ensuring reliability

This architecture will adequately serve the needs of Korean DJ organizers while remaining maintainable and cost-effective for a small business focused on helping friends rather than achieving massive scale.