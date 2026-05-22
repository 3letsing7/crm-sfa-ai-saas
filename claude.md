# Claude Development Guide

## Project Overview

This project is a cloud-based CRM / SFA SaaS system designed for IT companies and software vendors.

The system is intended to support:
- Customer management (CRM)
- Sales activity management (SFA)
- Proposal management
- Sales workflow optimization
- AI-assisted sales operations

This SaaS is also designed to align with the Japanese Digitalization / AI Subsidy requirements (共P-01 顧客対応・販売支援).

---

# Core Features

## CRM Features

- Customer management
- Contact history
- Notes and memos
- Customer search and filtering

## SFA Features

- Deal / opportunity management
- Sales status management
- Activity logs
- Task management
- Sales pipeline tracking

## Dashboard Features

- Sales overview
- Deal progress
- KPI summary

## AI Features (Phase 2+)

- AI proposal draft generation
- AI sales email generation
- AI meeting summary
- AI customer analysis

---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Supabase
  - PostgreSQL
  - Supabase Auth
  - Storage

## AI

- OpenAI API

## Hosting

- Vercel

---

# Development Rules

## General

- Keep implementation simple.
- Avoid overengineering.
- Prefer maintainability over cleverness.
- Use clean and readable TypeScript.

## UI Rules

- Use shadcn/ui components whenever possible.
- Keep UI minimal and business-oriented.
- Use responsive layouts.
- Prioritize desktop usability.
- Avoid excessive animations.

## Code Rules

- Use TypeScript strict mode.
- Use async/await.
- Prefer Server Components where possible.
- Keep business logic separated from UI.
- Use reusable components.

## API Rules

- Use Server Actions or Route Handlers.
- Validate all input.
- Handle errors gracefully.

## Database Rules

- Use UUID primary keys.
- Include created_at and updated_at fields.
- Use foreign key relationships properly.
- Avoid duplicated data.

---

# Folder Structure

```txt
/app
/components
/lib
/types
/hooks
/services
/docs