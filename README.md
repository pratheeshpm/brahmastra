Youtube Summary notes:
 http://localhost:3001/api/getytsummary?url=u6jhTo13_No 


#Start the receiver apps first, then start the sender apps
FOR GPT4 and no streaming: 
 gpt4=true npm run dev 
else:
 npm run dev
# Chatbot UI

Chatbot UI is an open source chat UI for AI models.

See a [demo](https://twitter.com/mckaywrigley/status/1640380021423603713?s=46&t=AowqkodyK6B4JccSOxSPew).

![Chatbot UI](./public/screenshots/screenshot-0402023.jpg)

## Updates

Chatbot UI will be updated over time.

Expect frequent improvements.

**Next up:**

- [ ] Sharing
- [ ] "Bots"

## Deploy

**Vercel**

Host your own live version of Chatbot UI with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmckaywrigley%2Fchatbot-ui)

**Docker**

Build locally:

```shell
docker build -t chatgpt-ui .
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 chatgpt-ui
```

Pull from ghcr:

```
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 ghcr.io/mckaywrigley/chatbot-ui:main
```

## Running Locally

**1. Clone Repo**

```bash
git clone https://github.com/mckaywrigley/chatbot-ui.git
```

**2. Install Dependencies**

```bash
npm i
```

**3. Provide OpenAI API Key**

Create a .env.local file in the root of the repo with your OpenAI API Key:

```bash
OPENAI_API_KEY=YOUR_KEY
```

> You can set `OPENAI_API_HOST` where access to the official OpenAI host is restricted or unavailable, allowing users to configure an alternative host for their specific needs.

> Additionally, if you have multiple OpenAI Organizations, you can set `OPENAI_ORGANIZATION` to specify one.

**4. Run App**

```bash
npm run dev
```

**5. Use It**

You should be able to start chatting.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_API_KEY                    |                                | The default API key used for authentication with OpenAI                                                                                   |
| OPENAI_API_HOST                   | `https://api.openai.com`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                                                                         |
| OPENAI_API_TYPE                   | `openai`                       | The API type, options are `openai` or `azure`                                                                                             |
| OPENAI_API_VERSION                | `2023-03-15-preview`           | Only applicable for Azure OpenAI                                                                                                          |
| AZURE_DEPLOYMENT_ID               |                                | Needed when Azure OpenAI, Ref [Azure OpenAI API](https://learn.microsoft.com/zh-cn/azure/cognitive-services/openai/reference#completions) |
| OPENAI_ORGANIZATION               |                                | Your OpenAI organization ID                                                                                                               |
| DEFAULT_MODEL                     | `gpt-3.5-turbo`                | The default model to use on new conversations, for Azure use `gpt-35-turbo`                                                               |
| NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT | [see here](utils/app/const.ts) | The default system prompt to use on new conversations                                                                                     |
| NEXT_PUBLIC_DEFAULT_TEMPERATURE   | 1                              | The default temperature to use on new conversations                                                                                       |
| GOOGLE_API_KEY                    |                                | See [Custom Search JSON API documentation][GCSE]                                                                                          |
| GOOGLE_CSE_ID                     |                                | See [Custom Search JSON API documentation][GCSE]                                                                                          |

If you do not provide an OpenAI API key with `OPENAI_API_KEY`, users will have to provide their own key.

If you don't have an OpenAI API key, you can get one [here](https://platform.openai.com/account/api-keys).

## Contact

If you have any questions, feel free to reach out to Mckay on [Twitter](https://twitter.com/mckaywrigley).

[GCSE]: https://developers.google.com/custom-search/v1/overview

code from : https://github.com/mckaywrigley/chatbot-ui


## UI Routes

-   **/**: The main chat interface of the application. This is where users can interact with the AI model, send messages, and view responses. Example: [http://localhost:3000/](http://localhost:3000/)
-   **/file-search**: This page provides a user interface for searching and browsing files on your system. It integrates with the file search API routes to allow users to select directories, search for files by name/AI, search file contents using grep, and view file content. Features both filename search (AI-powered) and content search (grep-based) modes. Example: [http://localhost:3000/file-search](http://localhost:3000/file-search)
-   **/youtube-search**: This page offers a dedicated interface for searching YouTube videos and generating summaries of their content. It utilizes the YouTube API routes to fetch video details, search for videos, and summarize transcripts. Example: [http://localhost:3000/youtube-search](http://localhost:3000/youtube-search)

## API Routes

### File Search

-   **/api/file-search/folders**: This route allows you to retrieve a list of common and recently accessed directories on your system. It helps in quickly navigating and selecting relevant folders for file-based operations within the application. Example: [http://localhost:3000/api/file-search/folders](http://localhost:3000/api/file-search/folders)
-   **/api/file-search/search**: This route enables you to search for files within a specified directory based on keywords using AI. It provides a convenient way to locate files relevant to your queries. Supports both POST and GET requests.
    - **POST**: Send JSON body with `query`, `files`, `maxResults`, and `fresh` parameters
    - **GET**: Use query parameters for direct URL access
    - **Default folder**: `/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main` (optimized for filename/structure search)
    - **Examples**:
      - Basic search: [http://localhost:3000/api/file-search/search?q=authentication](http://localhost:3000/api/file-search/search?q=authentication)
      - With custom folder: [http://localhost:3000/api/file-search/search?q=component&folder=/Users/pratheeshpm/Documents/Interview/leetcode/reactLibs](http://localhost:3000/api/file-search/search?q=component&folder=/Users/pratheeshpm/Documents/Interview/leetcode/reactLibs)
      - Fresh search with more results: [http://localhost:3000/api/file-search/search?q=api&maxResults=50&fresh=true](http://localhost:3000/api/file-search/search?q=api&maxResults=50&fresh=true)
      - Search in specific project: [http://localhost:3000/api/file-search/search?q=auth&folder=/Users/pratheeshpm/Documents/codebase/aiProjects/brahmastra](http://localhost:3000/api/file-search/search?q=auth&folder=/Users/pratheeshpm/Documents/codebase/aiProjects/brahmastra)
-   **/api/file-search/content-search**: This route performs fast content search within files using grep command. It searches for specific text patterns within file contents and returns matching lines with context. Supports both POST and GET requests.
    - **POST**: Send JSON body with detailed search options
    - **GET**: Use query parameters for direct URL access with fuzzy matching options
    - **Default folder**: `/Users/pratheeshpm/Documents/Interview/leetcode/leetcode-js` (optimized for code content search)
    - **Examples**:
      - Basic content search: [http://localhost:3000/api/file-search/content-search?q=function](http://localhost:3000/api/file-search/content-search?q=function)
      - Search with fuzzy matching: [http://localhost:3000/api/file-search/content-search?q=authentcate&enableFuzzy=true&enableFlexibleSpacing=true](http://localhost:3000/api/file-search/content-search?q=authentcate&enableFuzzy=true&enableFlexibleSpacing=true)
      - Search in JavaScript files: [http://localhost:3000/api/file-search/content-search?q=console.log&folder=/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems](http://localhost:3000/api/file-search/content-search?q=console.log&folder=/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems)
      - Advanced search with options: [http://localhost:3000/api/file-search/content-search?q=function%20authenticate&folder=/Users/pratheeshpm/Documents/codebase/aiProjects/brahmastra&caseSensitive=false&enableFuzzy=true&maxResults=200](http://localhost:3000/api/file-search/content-search?q=function%20authenticate&folder=/Users/pratheeshpm/Documents/codebase/aiProjects/brahmastra&caseSensitive=false&enableFuzzy=true&maxResults=200)
      - Search in React components: [http://localhost:3000/api/file-search/content-search?q=useState&folder=/Users/pratheeshpm/Documents/Interview/leetcode/reactLibs](http://localhost:3000/api/file-search/content-search?q=useState&folder=/Users/pratheeshpm/Documents/Interview/leetcode/reactLibs)
-   **/api/file-search/content**: This route is used to fetch the content of a specific file. Once a file is located using the search functionality, you can use this route to view its content. Example: [http://localhost:3000/api/file-search/content?path=/Users/pratheeshpm/Documents/example.txt](http://localhost:3000/api/file-search/content?path=/Users/pratheeshpm/Documents/example.txt)
-   **/api/file-search/list**: This route lists the contents of a directory, including subfolders and files. It\'s useful for exploring the file structure within a chosen directory. Example: [http://localhost:3000/api/file-search/list?path=/Users/pratheeshpm/Documents](http://localhost:3000/api/file-search/list?path=/Users/pratheeshpm/Documents)
-   **/api/file-search/open**: This route opens a specified file. It can be used to integrate with external tools or simply open files directly from the application interface. Example: [http://localhost:3000/api/file-search/open?path=/Users/pratheeshpm/Documents/example.txt](http://localhost:3000/api/file-search/open?path=/Users/pratheeshpm/Documents/example.txt)

#### Query Parameter Support

Both filename search and content search APIs now support GET requests with query parameters for easy integration and direct URL access:

**Filename Search Query Parameters:**
- `q` or `query`: Search term (required)
- `folder`: Target directory path (optional, defaults to system design folder)
- `maxResults`: Maximum number of results (optional, default: 10)
- `fresh`: Force fresh search, bypass cache (optional, default: false)

**Content Search Query Parameters:**
- `q` or `query`: Search term (required)
- `folder`: Target directory path (optional, defaults to current working directory)
- `caseSensitive`: Enable case-sensitive search (optional, default: false)
- `enableFuzzy`: Enable fuzzy matching (optional, default: false)
- `enableFlexibleSpacing`: Enable flexible spacing (optional, default: false)
- `maxResults`: Maximum number of results (optional, default: 100)
- `fileTypes`: File extensions to include (optional, can be repeated)
- `excludeDirs`: Directories to exclude (optional, can be repeated)
- `maxDistance`: Fuzzy matching distance (optional, default: 1)
- `includePartialMatches`: Include partial matches (optional, default: true)
- `customSubstitutions`: Custom character substitutions (optional, format: "a:e,i ph:f")

**Example URLs:**
```bash
# Filename search with AI
curl "http://localhost:3000/api/file-search/search?q=authentication%20logic&folder=/Users/username/project&maxResults=20"

# Content search with fuzzy matching
curl "http://localhost:3000/api/file-search/content-search?q=function%20authenticate&folder=/Users/username/project&enableFuzzy=true&enableFlexibleSpacing=true&caseSensitive=false&maxResults=100"

# Content search with file type filtering
curl "http://localhost:3000/api/file-search/content-search?q=import%20React&fileTypes=*.js&fileTypes=*.jsx&fileTypes=*.ts&fileTypes=*.tsx&excludeDirs=node_modules&excludeDirs=.git"

# Content search with custom substitutions
curl "http://localhost:3000/api/file-search/content-search?q=color&customSubstitutions=or:our%20er:re&maxDistance=2"
```

#### Content Search Feature

The content search functionality uses the powerful `grep` command to search within file contents, similar to terminal-based file searching. This provides fast and accurate text matching across your codebase with enhanced flexibility for real-world usage.

**Enhanced Search Examples:**
- **Flexible Spacing**: `"lowest common"` matches `"lowest      common"`, `"lowest\tcommon"`, or `"lowest\ncommon"`
- **Fuzzy Matching**: `"authentcate"` matches `"authenticate"`, `"recieve"` matches `"receive"`
- **Character Substitutions**: `"color"` matches `"colour"`, `"center"` matches `"centre"`
- **Missing Characters**: `"functon"` matches `"function"`, `"lenght"` matches `"length"`
- **Extra Characters**: `"proccessing"` matches `"processing"`, `"occured"` matches `"occurred"`

#### Enhanced Fuzzy Matching with Fuzzball Library

The fuzzy matching algorithm has been enhanced using the `fuzzball` library for more robust and extensible pattern generation:

**1. Fuzzball Integration:**
- Uses the `fuzzball` library for advanced fuzzy string processing
- Generates phonetic-like patterns for better matching
- Supports configurable fuzzy matching options

**2. Configurable Fuzzy Options:**
- `maxDistance`: Controls how many character differences are allowed (1-3)
- `includePartialMatches`: Include partial word matches for longer terms
- `customSubstitutions`: Define your own character substitution rules

**3. Advanced Pattern Generation:**
- **Character Substitutions**: `a ↔ e ↔ i`, `o ↔ u`, `s ↔ z`, `c ↔ k`, `f ↔ ph`
- **Missing Characters**: Generates patterns with each character removed
- **Extra Characters**: Adds common doubled letters
- **Phonetic Patterns**: `ph → f`, `ck → k`, `qu → kw`, `tion → shun`
- **Prefix/Suffix Handling**: Recognizes common prefixes and suffixes

**4. Frontend Advanced Options:**
- Collapsible advanced settings panel
- Preset configurations (Default, Vowel Swap, Phonetic)
- Custom substitution input with validation
- Real-time fuzzy option configuration

**5. Example Advanced Usage:**
```javascript
// Custom substitutions for British/American English
"customSubstitutions": {
  "or": ["or", "our"],    // color ↔ colour
  "er": ["er", "re"],     // center ↔ centre
  "ize": ["ize", "ise"]   // organize ↔ organise
}

// Phonetic matching
"customSubstitutions": {
  "f": ["f", "ph"],       // phone ↔ fone
  "k": ["k", "c", "ck"],  // quick ↔ quic ↔ qwick
  "s": ["s", "z"]         // realize ↔ realise
}
```

#### How Fuzzy Matching Works

The fuzzy matching algorithm generates alternative patterns for common spelling mistakes and variations:

**1. Character Substitutions:**
- Vowel confusion: `a ↔ e ↔ i`, `o ↔ u`
- Sound-alike: `s ↔ z`, `c ↔ k`, `f ↔ ph`
- Regional differences: `y ↔ i` (e.g., "color" vs "colour")
- Common endings: `tion ↔ sion` (e.g., "creation" vs "creacion")

**2. Missing Character Patterns:**
- Generates patterns with each character removed one at a time
- Example: `"function"` → `"functon"`, `"funtion"`, `"functio"`, etc.
- Only applied to words longer than 3 characters

**3. Extra Character Patterns:**
- Adds common doubled letters: `l`, `r`, `n`, `m`, `s`, `t`
- Example: `"processing"` → `"proccessing"`, `"processsing"`
- Only adds if the letter isn't already doubled

**4. Regex Pattern Generation:**
```javascript
// Example: searching for "authenticate"
// Generates patterns like:
"(authenticate|authentcate|authentecate|authenticete|authentiate|authinticate)"

// For multi-word: "lowest common"
// Generates:
"(lowest|lowist|loweest)\\s+(common|comon|comman)"
```

**5. Performance Optimizations:**
- Fuzzy matching only applies to words > 3 characters
- Limits pattern alternatives to prevent regex explosion
- Uses `Set` to deduplicate generated patterns
- Context lines only fetched for first 20 results

**6. Security Considerations:**
- Input sanitization removes dangerous shell characters
- Regex patterns are validated before execution
- Command injection prevention through proper escaping

**Key Features:**
- **Fast grep-based search**: Uses the native `grep` command for optimal performance
- **Flexible spacing**: Handles multiple spaces, tabs, and newlines (e.g., "lowest      common" matches "lowest common")
- **Fuzzy matching**: Handles common spelling mistakes and typos (e.g., "authentcate" matches "authenticate")
- **Context display**: Shows lines before and after matches for better understanding
- **File type filtering**: Supports filtering by file extensions (JS, TS, Python, etc.)
- **Directory exclusions**: Automatically excludes common directories like `node_modules`, `.git`, etc.
- **Case sensitivity control**: Toggle between case-sensitive and case-insensitive search
- **Configurable results**: Set maximum number of results (50-500)
- **Security**: Input sanitization prevents command injection attacks

**Terminal Equivalent:**
```bash
# Basic search
grep -rni "search_term" /path/to/folder --include="*.js" --exclude-dir=node_modules

# Enhanced search with flexible spacing and fuzzy matching
grep -rniE "(search_term|serach_term|search\\s+term)" /path/to/folder --include="*.js" --exclude-dir=node_modules
```

**API Usage:**
```javascript
// POST /api/file-search/content-search
{
  "query": "function authenticate",
  "folder": "/Users/username/project",
  "caseSensitive": false,
  "maxResults": 100,
  "enableFuzzy": true,
  "enableFlexibleSpacing": true,
  "fuzzyOptions": {
    "maxDistance": 2,
    "includePartialMatches": true,
    "customSubstitutions": {
      "or": ["or", "our"],
      "er": ["er", "re"]
    }
  },
  "fileTypes": ["*.js", "*.ts", "*.jsx", "*.tsx"],
  "excludeDirs": ["node_modules", ".git", "dist"]
}

// GET /api/file-search/content-search
// ?q=function%20authenticate&folder=/Users/username/project&enableFuzzy=true&maxDistance=2&customSubstitutions=or:our,er:re
```

**Response Format:**
```javascript
{
  "success": true,
  "results": [
    {
      "file": "/full/path/to/file.js",
      "fileName": "file.js",
      "relativePath": "src/auth/file.js",
      "lineNumber": 42,
      "content": "function authenticate(user, password) {",
      "fileExtension": ".js",
      "contextBefore": "// Authentication logic\nconst bcrypt = require('bcrypt');",
      "contextAfter": "  if (!user || !password) {\n    throw new Error('Missing credentials');"
    }
  ],
  "totalMatches": 15,
  "executionTime": 45,
  "command": "grep -rni \"function authenticate\" \"/path\" --include=\"*.js\"",
  "queryParams": {
    "query": "function authenticate",
    "folder": "/Users/username/project",
    "enableFuzzy": true,
    "fuzzyOptions": {
      "maxDistance": 2,
      "includePartialMatches": true,
      "customSubstitutions": {"or": ["or", "our"]}
    }
  }
}
```

### File Search API Examples

Here are working URL examples for direct API access:

#### 🔍 **Content Search URLs** (searches within file contents using grep)

**Base URL**: `http://localhost:3000/api/file-search/content-search`

**Working Examples**:

1. **Basic content search** (uses default leetcode-js folder):
   ```
   http://localhost:3000/api/file-search/content-search?q=function
   ```

2. **Search in JavaScript problems folder**:
   ```
   http://localhost:3000/api/file-search/content-search?q=function&folder=/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems
   ```

3. **Search with fuzzy matching** (finds typos like "functoin" → "function"):
   ```
   http://localhost:3000/api/file-search/content-search?q=functoin&enableFuzzy=true&enableFlexibleSpacing=true&maxResults=50
   ```

4. **Case-sensitive search with flexible spacing**:
   ```
   http://localhost:3000/api/file-search/content-search?q=console.log&folder=/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems&caseSensitive=false&enableFlexibleSpacing=true
   ```

5. **Search with all options**:
   ```
   http://localhost:3000/api/file-search/content-search?q=authenticate&folder=/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems&caseSensitive=false&enableFuzzy=true&enableFlexibleSpacing=true&maxResults=100
   ```

#### 📄 **Filename Search URLs** (searches file and folder names using AI)

**Base URL**: `http://localhost:3000/api/file-search/search`

**Working Examples**:

1. **Basic filename search** (uses default system-design folder):
   ```
   http://localhost:3000/api/file-search/search?q=youtube
   ```

2. **Search in specific folder**:
   ```
   http://localhost:3000/api/file-search/search?q=payment&folder=/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main&maxResults=10
   ```

3. **Fresh search (bypass cache)**:
   ```
   http://localhost:3000/api/file-search/search?q=authentication&folder=/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main&maxResults=20&fresh=true
   ```

#### 🌐 **Frontend URL Examples** (opens the search interface with pre-filled parameters)

**Base URL**: `http://localhost:3000/file-search`

**Working Examples**:

1. **Content search with query and folder**:
   ```
   http://localhost:3000/file-search?q=function&mode=content&folder=/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems
   ```

2. **Filename search with query**:
   ```
   http://localhost:3000/file-search?q=youtube&mode=filename&folder=/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main
   ```

3. **Content search with fuzzy matching**:
   ```
   http://localhost:3000/file-search?q=authentcate&mode=content
   ```

#### 📋 **URL Parameters Reference**

**Content Search API Parameters**:
- `q` or `query`: Search term (required)
- `folder`: Target folder path (optional, uses default if not specified)
- `caseSensitive`: true/false (default: false)
- `enableFuzzy`: true/false (default: true)
- `enableFlexibleSpacing`: true/false (default: true)
- `maxResults`: Number (default: 100, options: 50, 100, 200, 500)

**Filename Search API Parameters**:
- `q` or `query`: Search term (required)
- `folder`: Target folder path (optional, uses default if not specified)
- `maxResults`: Number (default: 10)
- `fresh`: true/false (default: false, bypasses cache when true)

**Frontend Parameters**:
- `q` or `query`: Search term
- `mode`: "content" or "filename"
- `folder`: Target folder path (will be selected in dropdown if available)

#### 🎯 **Smart Folder Selection**

The application automatically selects appropriate default folders based on search mode:
- **Content Search**: `/Users/pratheeshpm/Documents/Interview/leetcode/leetcode-js` (optimized for JavaScript code search)
- **Filename Search**: `/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main` (optimized for system design documents)

If a folder is specified in the URL but doesn't exist in the available folders list, the application will:
1. Show a warning message
2. Fall back to the appropriate default folder for the search mode
3. Continue with the search operation

#### 🚀 **Performance Features**

- **Intelligent Caching**: Both APIs cache results for faster subsequent searches
- **Fuzzy Matching**: Advanced pattern matching with customizable distance and substitution rules
- **Flexible Spacing**: Handles multiple spaces, tabs, and newlines in search patterns
- **Security**: Input sanitization prevents command injection attacks
- **Context Display**: Content search shows surrounding lines for better understanding

### YouTube Search and Summarization

-   **/api/youtube/details**: This route retrieves detailed information about a YouTube video, including its title, description, and other metadata. It\'s used to get comprehensive information about a video. Example: [http://localhost:3000/api/youtube/details?videoId=dQw4w9WgXcQ](http://localhost:3000/api/youtube/details?videoId=dQw4w9WgXcQ)
-   **/api/youtube/summarize**: This route generates a summary of a YouTube video\'s content. It leverages the video\'s transcript to provide a concise overview, useful for quick comprehension without watching the entire video. Example: [http://localhost:3000/api/youtube/summarize?videoId=dQw4w9WgXcQ](http://localhost:3000/api/youtube/summarize?videoId=dQw4w9WgXcQ)
-   **/api/youtube/search**: This route performs a search for YouTube videos based on a given query. It returns a list of relevant videos, allowing users to find specific content within YouTube. Example: [http://localhost:3000/api/youtube/search?query=system+design+interview](http://localhost:3000/api/youtube/search?query=system+design+interview)