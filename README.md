# Node Authentication Service
User authentication service used to authenticate users and user actions via local and thirdparty providers and JWTs.

### Tech Stack
- Docker
- Node
- MongoDB

### Features
- Stateless API (JSON Web Tokens)
- Multiple stragegies using vender Oauth APIs
	- Local (Email / Password)
	- Google
	- Microsoft
	- Vimeo
	- Adobe (?)
- Create JWT
- Read JWT
- Validate JWT

### Data
User Model
```JS
{
	nickname: String,
    firstname: String,
    lastname: String,
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
Token Model
```JS
{
    user_id: String,
    client_id: String,
    name: String,
    provider: String,
    revoked: Boolean,
    created_at: Date,
    expires_at: Date
}
```

### Routes
/users/list
/users/me
/users/token
/users/token/revoke
/users/create
/users/update
/users/delete

/tokens/list
/tokens/revoke
/tokens/delete
