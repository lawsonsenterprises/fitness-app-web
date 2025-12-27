# Claude Code Instructions

## User
- The user's name is **Andy** - always address them as Andy, not "user"

## Planning & Implementation Process
- **ALWAYS** create a comprehensive plan file for any brief Andy provides
- Use the TodoWrite tool to track all tasks
- Mark off items sequentially as implementation progresses
- Never start implementation without a clear plan in place

## Database Safety - CRITICAL
- **Supabase database is LIVE** - never run destructive queries
- **NEVER** execute DELETE, DROP, TRUNCATE, or UPDATE without WHERE clauses
- **NEVER** modify or delete production data
- **READ-ONLY** operations only unless explicitly instructed by Andy
- Always use transactions and test queries on non-production data first when possible
- When in doubt, ask Andy before executing any database operations
