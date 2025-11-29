# Arsitektur Web Note App

## Diagram Arsitektur

```mermaid
graph TB
    subgraph "Client Side"
        A[Mobile/Desktop Browser] --> B[HTML/CSS/JS Frontend]
        B --> C[Clerk Auth SDK]
        B --> D[Notes UI Components]
    end
    
    subgraph "Netlify Platform"
        E[Netlify Hosting] --> F[Static Files]
        E --> G[Serverless Functions]
        G --> H[create-note.js]
        G --> I[read-notes.js]
        G --> J[update-note.js]
        G --> K[delete-note.js]
    end
    
    subgraph "External Services"
        L[Clerk Authentication]
        M[Neon PostgreSQL Database]
    end
    
    C --> L
    H --> M
    I --> M
    J --> M
    K --> M
    
    B --> G
    L --> G
```

## Flow Data

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Clerk
    participant N as Netlify Functions
    participant DB as Neon DB
    
    Note over U,DB: Login Flow
    U->>F: Open App
    F->>C: Check Auth Status
    C-->>F: Not Authenticated
    F->>U: Show Login Form
    U->>F: Login Credentials
    F->>C: Authenticate
    C-->>F: Auth Success
    F->>U: Show Dashboard
    
    Note over U,DB: Create Note Flow
    U->>F: Create New Note
    F->>N: POST /create-note
    N->>C: Verify User Token
    C-->>N: Valid User
    N->>DB: INSERT INTO notes
    DB-->>N: Note Created
    N-->>F: Success Response
    F->>U: Show New Note
    
    Note over U,DB: Read Notes Flow
    U->>F: View Notes
    F->>N: GET /read-notes
    N->>C: Verify User Token
    C-->>N: Valid User
    N->>DB: SELECT * FROM notes WHERE user_id=?
    DB-->>N: User Notes
    N-->>F: Notes Data
    F->>U: Display Notes
```

## Komponen UI

```mermaid
graph LR
    A[App Container] --> B[Header]
    A --> C[Main Content]
    A --> D[Footer]
    
    B --> E[Logo/Title]
    B --> F[User Profile]
    B --> G[Logout Button]
    
    C --> H[Notes List]
    C --> I[Note Editor]
    C --> J[Empty State]
    
    H --> K[Note Card]
    K --> L[Title]
    K --> M[Content Preview]
    K --> N[Actions]
    
    I --> O[Title Input]
    I --> P[Content Textarea]
    I --> Q[Save Button]
    I --> R[Cancel Button]
```

## Database Schema

```mermaid
erDiagram
    NOTES {
        int id PK
        varchar user_id FK
        varchar title
        text content
        timestamp created_at
        timestamp updated_at
    }
    
    USERS {
        varchar id PK
        string email
        string name
        timestamp created_at
    }
    
    NOTES ||--o{ USERS : belongs_to