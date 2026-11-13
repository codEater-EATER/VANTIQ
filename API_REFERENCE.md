# VANTIQ API Reference

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.vantiq.yourdomain.com` (or Railway URL)

---

## Authentication

All API endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

### Get Token (Login)

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## AI Endpoints (Qwen)

### 1. Score Lead

Score a lead using Qwen Max AI. Returns a score 0-100 with reasoning.

```bash
POST /api/v1/ai/score-lead
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadData": "Company: Acme Corp, Revenue: $5M, Industry: Tech, Employees: 50, Location: San Francisco, Website: acme.com"
}
```

**Response:**
```json
{
  "score": 85,
  "reasoning": "High-quality lead due to established company size, relevant industry, and clear location data.",
  "answer": "Score: 85/100. This is a high-quality B2B lead. The company shows strong indicators of being a qualified prospect: established revenue ($5M+), appropriate company size (50 employees suggests mid-market), tech industry alignment, and verifiable location. Conversion potential is strong.",
  "timestamp": "2024-11-13T10:30:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid lead data
- `401` - Unauthorized
- `500` - AI API error

---

### 2. Explain Qualification

Generate detailed explanation of why a lead is qualified or not.

```bash
POST /api/v1/ai/explain-qualification
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadData": "Company: TechStartup Inc, Founded: 2023, Funding: Seed round, Revenue: Not yet profitable"
}
```

**Response:**
```json
{
  "explanation": "This lead shows mixed qualification signals:\n\n✓ POSITIVE:\n- Recent funding indicates serious commitment\n- Tech startup suggests alignment with modern solutions\n\n✗ CONCERNS:\n- Pre-revenue status indicates cash flow constraints\n- Very new company (founded 2023) - still establishing\n\nRECOMMENDATION: Qualified as a long-term opportunity but not immediate sales target. Follow up with nurture content.",
  "timestamp": "2024-11-13T10:35:00Z"
}
```

---

### 3. Optimize Campaign

Get AI-powered recommendations to improve a campaign.

```bash
POST /api/v1/ai/optimize-campaign
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaignData": "Campaign: Q4 Tech Summit Leads, Audience: 10,000 tech directors, Current conversion: 2%, Budget: $50,000, Channel: LinkedIn, Duration: 30 days"
}
```

**Response:**
```json
{
  "recommendations": "## Campaign Optimization Recommendations\n\n### 1. MESSAGING (Highest Impact)\n- Current: Generic product pitch\n- Recommended: ROI-focused value prop (\"Reduce operational costs by 30%\")\n- Reasoning: Tech directors respond 3x better to business outcome messaging\n\n### 2. TARGETING (Medium Impact)\n- Narrow to companies $10-100M revenue (sweet spot for mid-market solutions)\n- Add job titles: VP Engineering, CTO, Engineering Manager\n- Exclude: Companies already in contract discussions\n- Expected improvement: +1-2% conversion\n\n### 3. CREATIVE (Medium Impact)\n- A/B test: Case study + demo video (typically 40% higher engagement)\n- Test different CTAs: \"See ROI calculator\" vs \"Schedule demo\"\n- Mobile optimization: 35% of your audience browses on mobile\n\n### 4. TIMING (Lower Impact)\n- Best times: Tuesday-Thursday, 10am-12pm (target timezone)\n- Avoid: Mondays (17% lower engagement) and Fridays after 3pm\n\n### 5. FOLLOW-UP (Critical for Conversion)\n- Add nurture sequence: 3-email follow-up over 14 days\n- Current gap: High click-through but low conversion suggests message mismatch\n- Recommended: Personalized follow-up within 24 hours\n\n## Expected Results\n- Conservative: 2% → 2.8% conversion (+40% improvement)\n- Optimistic: 2% → 3.5% conversion (+75% improvement)\n- ROI: $50,000 → $60,000-75,000 additional qualified leads",
  "timestamp": "2024-11-13T10:40:00Z"
}
```

---

## Leads Endpoints

### Get All Leads

```bash
GET /api/v1/leads?page=1&limit=20&status=open
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `status` - Filter by status: `open`, `qualified`, `disqualified`, `converted`
- `campaignId` - Filter by campaign
- `search` - Search by company name or contact

**Response:**
```json
{
  "data": [
    {
      "id": "lead-123",
      "companyName": "Acme Corp",
      "contactName": "Jane Doe",
      "email": "jane@acme.com",
      "phone": "+1-555-0123",
      "status": "qualified",
      "score": 85,
      "createdAt": "2024-11-01T10:00:00Z",
      "tags": ["tech", "enterprise"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

---

### Create Lead

```bash
POST /api/v1/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Acme Corp",
  "industry": "Technology",
  "employees": 50,
  "revenue": 5000000,
  "location": "San Francisco, CA",
  "contactName": "Jane Doe",
  "email": "jane@acme.com",
  "phone": "+1-555-0123",
  "website": "https://acme.com",
  "source": "LinkedIn",
  "campaignId": "campaign-123",
  "customFields": {
    "decision_maker": "VP Sales",
    "budget_allocated": "yes"
  }
}
```

**Response:**
```json
{
  "id": "lead-456",
  "companyName": "Acme Corp",
  "email": "jane@acme.com",
  "status": "new",
  "score": 0,
  "createdAt": "2024-11-13T10:45:00Z"
}
```

---

### Update Lead

```bash
PUT /api/v1/leads/{leadId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "qualified",
  "score": 85,
  "notes": "Hot prospect, decision maker engaged"
}
```

---

### Delete Lead

```bash
DELETE /api/v1/leads/{leadId}
Authorization: Bearer <token>
```

---

## Campaigns Endpoints

### Get Campaigns

```bash
GET /api/v1/campaigns
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "campaign-123",
      "name": "Q4 Tech Summit",
      "status": "active",
      "startDate": "2024-11-01",
      "endDate": "2024-11-30",
      "budget": 50000,
      "leadsGenerated": 250,
      "createdAt": "2024-10-15T10:00:00Z"
    }
  ]
}
```

---

### Create Campaign

```bash
POST /api/v1/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q4 Tech Summit",
  "description": "LinkedIn campaign targeting tech directors",
  "startDate": "2024-11-01",
  "endDate": "2024-11-30",
  "budget": 50000,
  "status": "active",
  "channel": "LinkedIn",
  "targetAudience": {
    "industry": ["Technology", "Finance"],
    "companySize": "50-500",
    "jobTitles": ["Director", "VP", "C-Suite"]
  }
}
```

---

## Analytics Endpoints

### Get Dashboard Metrics

```bash
GET /api/v1/analytics/dashboard?period=month
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` - `day`, `week`, `month`, `year` (default: month)

**Response:**
```json
{
  "metrics": {
    "totalLeads": 1250,
    "qualifiedLeads": 340,
    "conversionRate": 27.2,
    "avgScore": 72.5,
    "leadsThisPeriod": 240,
    "campaignsActive": 8,
    "revenue": 125000
  },
  "trends": {
    "leadsGrowth": 15.3,
    "conversionGrowth": 3.2
  }
}
```

---

### Get Leads by Campaign

```bash
GET /api/v1/analytics/campaigns/{campaignId}/leads
Authorization: Bearer <token>
```

---

## Integrations Endpoints

### List Integrations

```bash
GET /api/v1/integrations
Authorization: Bearer <token>
```

---

### Create Integration

```bash
POST /api/v1/integrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "apollo",
  "name": "Apollo.io - Lead Enrichment",
  "credentials": {
    "apiKey": "your-apollo-api-key"
  },
  "enabled": true
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Invalid lead data",
  "error": "BadRequest",
  "timestamp": "2024-11-13T10:50:00Z",
  "path": "/api/v1/leads"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |
| 503 | Service Unavailable - Maintenance |

---

## Rate Limiting

- **Free tier**: 100 requests/minute
- **Pro tier**: 1,000 requests/minute
- **Enterprise**: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1631234567
```

---

## Webhooks

Register webhooks to receive events:

### Webhook Events

```json
{
  "leadQualified": {
    "leadId": "lead-123",
    "score": 85,
    "timestamp": "2024-11-13T10:55:00Z"
  },
  "campaignCompleted": {
    "campaignId": "campaign-456",
    "leadsGenerated": 250,
    "totalSpent": 50000
  }
}
```

### Register Webhook

```bash
POST /api/v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://yourdomain.com/webhook",
  "events": ["leadQualified", "campaignCompleted"],
  "active": true
}
```

---

## SDK Examples

### TypeScript/Node.js

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.vantiq.com',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Score a lead
const result = await client.post('/api/v1/ai/score-lead', {
  leadData: 'Company: Acme Corp, Revenue: $5M'
});

console.log(result.data.score); // 85
```

### JavaScript (Browser)

```javascript
const response = await fetch('https://api.vantiq.com/api/v1/ai/score-lead', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    leadData: 'Company: Acme Corp, Revenue: $5M'
  })
});

const data = await response.json();
console.log(data.score);
```

### cURL

```bash
curl -X POST https://api.vantiq.com/api/v1/ai/score-lead \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"leadData": "Company: Acme Corp, Revenue: $5M"}'
```

---

## Testing

### Use Postman Collection

Import this endpoint to Postman for easy testing:
```
https://api.vantiq.com/api/docs
```

### Test API Locally

```bash
# Start backend
npm run dev --workspace=@vantiq/backend

# In another terminal
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vantiq.com","password":"admin123"}'
```

---

## Pagination

All list endpoints support pagination:

```bash
GET /api/v1/leads?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 1250,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## Filtering & Sorting

### Filter

```bash
GET /api/v1/leads?status=qualified&score[gte]=80
```

### Sort

```bash
GET /api/v1/leads?sort=-createdAt,score
# Newest first, then by score
```

---

## Best Practices

1. **Cache responses** - Leads don't change often, cache for 1 hour
2. **Use pagination** - Never load all records at once
3. **Handle rate limits** - Implement exponential backoff
4. **Validate input** - Always validate before sending
5. **Use webhooks** - Don't poll; use webhooks for real-time updates
6. **Log requests** - Log all AI API calls for debugging
7. **Test in staging** - Always test before production

---

## Support

- **Docs**: https://docs.vantiq.com
- **Status**: https://status.vantiq.com
- **Email**: support@vantiq.com
- **Slack**: #api-support

---

**Last Updated:** November 13, 2024  
**API Version:** v1.0.0
