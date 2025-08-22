First check for any unfinished job that if failed in last task, if complete proceed with these: 


 1. i want solution manager to be used by all other question solver types like leetcode/js/react so on. n it shud organise n keep the files too based on the question category. 2. Create another endpoint n feature that scrapes the web for the question asked (could be anything like system design interview question) and creates a very comprehensive doc with mermaid diagram code with clear explanations in it in detail. For this task, check if openai exposes any tools or apis to scrape the web (check @Web for the same ) or use the openrouter sonar perplexity model for scraping(Openrouter key is in env variable)


hi, ill give you a frontend system design question n you have to answer (unless asked specifically) in this format: 

Frontend system design: 

`
#### **1. Clarify Requirements**

* Functional & non-functional goals
* Target devices, scale, performance expectations

#### **2. Constraints**

* Tech stack (React, Vue), SSR/CSR, hosting, API format
* Network limits, SEO, accessibility

#### **3. High-Level Architecture**

* SPA vs MPA, SSR vs CSR vs ISR
* State management: Redux, Context, React Query
* API integration (REST/GraphQL/WebSockets)

---

#### **4. Component Hierarchy (Tree)**

Example for a **Dashboard App**:

```
App
 ├── Header
 ├── Sidebar
 ├── Dashboard
 │    ├── StatsCard
 │    ├── Chart
 │    └── ActivityFeed
 └── Footer
```

---

#### **5. Main Component Interfaces (TypeScript)**

```ts
interface StatsCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down';
}

interface ChartProps {
  data: Array<{ x: string; y: number }>;
  type: 'line' | 'bar';
}
```

---

#### **6. Sample API Structures**

**GET /api/dashboard**

```json
{
  "stats": [
    { "title": "Users", "value": 1200, "trend": "up" },
    { "title": "Revenue", "value": 5000, "trend": "down" }
  ],
  "chartData": [
    { "x": "2025-08-01", "y": 100 },
    { "x": "2025-08-02", "y": 150 }
  ]
}
```

---

#### **7. Data Flow & State**

* API → React Query → Global State → Components
* Local state for UI (modals, filters)

---

#### **8. Performance**

* Code splitting, lazy loading
* Memoization, virtualization, CDN for assets

---

#### **9. Security**

* XSS, CSRF, Content Security Policy
* Token handling (HTTP-only cookies vs localStorage)

---

#### **10. Edge Cases**

* Empty states, loading skeletons, retries, offline

---

#### **11. Trade-offs**

* Why SSR for SEO? Why WebSockets vs polling?


`