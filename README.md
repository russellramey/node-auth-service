# Authentication Service
User authentication service, as REST API, used to authenticate users and requests via local and third-party providers with JSON Web Tokens.

### Tech Stack
- Docker
- Node
- Express
- Passport
- MongoDB

### Features
- Stateless API (JSON Web Tokens)
- Multiple stragegies using vender Oauth APIs
	- Local (Email / Password)
	- Google (TBD)
	- Microsoft (TBD)
	- Vimeo (TBD)
	- Adobe (TBD)
- User registration
- User authentication
- Token management
- Token issuing
- Token validation

### Data
User model
```JS
{
	nickname: String,
    email: String,
    email_valid: Boolean,
    password: String,
    created_at: Date,
    updated_at: Date,
    scopes: Array,
    provider: {
    	name: String,
    	id: String
    }
}
```
Token model
```JS
{
    user_id: String,
    name: String,
    provider: String,
    revoked: Boolean,
    created_at: Date,
    expires_at: Date,
	hash: String,
	client: String
}
```

### Model Routes
- GET /users - Return all users
- GET /users/me - Return authenticated user
- GET /tokens - Return all tokens

### Authentication Routes
- /auth/local - Authenticate user via email/password
