# OpenAI API Setup for AI Search Component

## Overview
The AI Search component uses OpenAI's Conversations/Responses API to analyze user queries and find relevant travel items from the dummy data.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### 2. Configure Environment Variables

#### Option A: Environment File (Recommended for Development)
Create a `.env` file in the project root:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

#### Option B: System Environment Variable
Set the environment variable in your shell:
```bash
export OPENAI_API_KEY=sk-your-api-key-here
```

#### Option C: Direct in Environment Files (Not Recommended for Production)
Update `src/environments/environment.development.ts`:
```typescript
export const environment = {
  OPENAI_API_KEY: 'sk-your-api-key-here'
};
```

### 3. Restart Development Server
After setting the environment variable, restart your development server:
```bash
npm start
```

## Usage

### How It Works
1. User enters a natural language query (e.g., "I want to explore Paris on a budget")
2. The AI analyzes the query and searches through available travel data
3. AI returns relevant items with reasoning for the selection
4. Results are displayed as cards with pagination

### Example Queries
- "Budget-friendly activities in Paris"
- "Luxury hotels with spa facilities"
- "Family-friendly restaurants near tourist attractions"
- "Adventure activities for thrill-seekers"
- "Romantic dinner spots with city views"
- "Cultural experiences and museums"

### API Configuration
- **Model**: GPT-3.5-turbo
- **Temperature**: 0.3 (for consistent results)
- **Max Tokens**: 1000
- **Endpoint**: OpenAI Chat Completions API

## Security Notes
- Never commit API keys to version control
- Use environment variables for production deployments
- Consider implementing rate limiting for production use
- Monitor API usage and costs

## Troubleshooting

### Common Issues
1. **"OpenAI API key not configured"**
   - Check that the environment variable is set correctly
   - Restart the development server after setting the variable

2. **"Error calling OpenAI API"**
   - Verify your API key is valid
   - Check your OpenAI account has sufficient credits
   - Ensure you have access to the GPT-3.5-turbo model

3. **"No JSON found in response"**
   - This is a parsing error from the AI response
   - Try rephrasing your query
   - Check the browser console for detailed error logs

### Testing
Test the component by navigating to `/ai-search` and trying various natural language queries. The AI should return relevant results with reasoning for each selection. 