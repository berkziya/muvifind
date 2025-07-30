# TMDB API Setup Instructions

This guide will help you set up TMDB API authentication using Bearer Token for the MuviFInd application.

## Getting Your TMDB Bearer Token

1. **Create a TMDB Account**
   - Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
   - Sign up for a free account if you don't have one

2. **Access API Settings**
   - Log in to your TMDB account
   - Go to your account settings: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - You'll see an "API Read Access Token" section

3. **Copy Your Bearer Token**
   - Copy the "API Read Access Token" (this is your Bearer Token)
   - It should look like: `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI...`

## Setting Up Authentication

### For Local Development

Create a `.dev.vars` file in your project root:

```bash
# .dev.vars
TMDB_BEARER_TOKEN=your_actual_bearer_token_here
```

### For Cloudflare Workers Production

Set the Bearer Token as a secret in Cloudflare Workers:

```bash
wrangler secret put TMDB_BEARER_TOKEN
# Enter your bearer token when prompted
```

## Why Bearer Token?

The Bearer Token method is preferred over API keys because:

- ✅ **More Secure**: Uses JWT tokens instead of plain API keys
- ✅ **Future-Proof**: Works with both TMDB API v3 and v4
- ✅ **Standard**: Follows OAuth 2.0 Bearer Token standard
- ✅ **Single Auth**: One token for all TMDB API endpoints

## API Usage Examples

Our application uses the Bearer token in the Authorization header:

```javascript
const response = await fetch('https://api.themoviedb.org/3/search/person?query=tom+hanks', {
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
  }
});
```

## Troubleshooting

### Common Issues

1. **Token not working**: Make sure you copied the full token without extra spaces
2. **Authentication failed**: Verify the token is set correctly in your environment
3. **Rate limiting**: TMDB allows 40 requests per 10 seconds for authenticated requests

### Verification

You can test your token with curl:

```bash
curl --request GET \
     --url 'https://api.themoviedb.org/3/movie/11' \
     --header 'Authorization: Bearer YOUR_TOKEN_HERE'
```

## Security Notes

- 🔒 **Never commit tokens to git**: Always use environment variables
- 🔒 **Keep tokens private**: Don't share your Bearer Token
- 🔒 **Use secrets for production**: Always use Cloudflare secrets for production deployment
