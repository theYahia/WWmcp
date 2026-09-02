---
name: courses
description: GetCourse management - users, deals, student creation
argument-hint: [email] [name] [group]
allowed-tools:
  - Bash
  - Read
---

# /courses -- GetCourse management

## Algorithm

1. Call get_users for user list
2. Call get_deals for deals list
3. Call create_user to add a new student
4. Show operation result

## Examples

    /courses
    /courses user@example.com Ivan Group1
