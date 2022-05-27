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
	username: String,
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
    user: Object,
    name: String,
    revoked: Boolean,
    created_at: Date,
    expires_at: Date,
	refresh_token: String,
	refresh_id: String,
	client: Object
}
```

### Model Routes
- GET /users - Return all users
- GET /users/me - Return current authenticated user (via Token)
- GET /users/:userid - Return single user (via ID)
- GET /tokens - Return all tokens
- POST /tokens/refresh - Generate new token from refresh token
- POST /tokens/revoke - Revoke token from post body or authorization header

### Authentication Routes
- POST /auth/local - Authenticate current user or create new user
- POST /auth/local/password-token - Request password reset token for user
- POST /auth/local/password-reset - Reset user password via reset issued token
