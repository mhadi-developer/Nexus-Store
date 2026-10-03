# Full-Stack E-Commerce & Microservice Architecture

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An enterprise-grade, high-performance e-commerce architecture engineered with a decoupled React client and a modern, asynchronous FastAPI Python backend. Designed with modularity, strict input validation, and clean separation of concerns in mind.

---

## 🏗️ Architectural Overview

```text
┌────────────────┐          REST API / JSON          ┌─────────────────┐
│                │ ────────────────────────────────> │                 │
│  React Client  │                                   │ FastAPI Backend │
│  (Vite / JSX)  │ <──────────────────────────────── │ (Async / ASGI)  │
└────────────────┘          Pydantic Schemas         └─────────────────┘



🛠️ Technology Stack & Design Decisions
Backend Engine (FastAPI / Python)
Asynchronous Execution: Built using Python's async/await paradigm via Uvicorn (ASGI) for non-blocking I/O operations and high concurrency throughput.

Strict Schema Validation: Utilizes Pydantic models for request/response serialization, data integrity, and automatic OpenAPI specification generation.

Modular Routing: Scalable router structures separating core business logic, domain models, and API endpoints.

Frontend Interface (React / JavaScript)
Component-Driven Architecture: Reusable, stateful functional components (Catalog Grid, Product Detail View, Global Loader overlay).

Styling Strategy: Pure, modular external CSS sheets adhering to modern design principles, fluid grid layouts, and responsive media queries



📂 Project Structure
.
├── backend/
│   ├── app/
│   │   ├── api/          # API route controllers
│   │   ├── core/         # Config, security, and middleware
│   │   ├── models/       # Pydantic data schemas
│   │   └── main.py       # FastAPI application entry point
│   ├── requirements.txt  # Python dependency manifest
│   └── venv/             # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components (ProductDetail, Loader, etc.)
│   │   ├── styles/       # External modular stylesheets
│   │   ├── App.jsx       # Root component & state orchestration
│   │   └── main.jsx      # React DOM entry point
│   └── package.json      # Node dependency manifest
│
└── README.md



🚀 Getting Started
Prerequisites
Python 3.10+

Node.js 18+ & npm/yarn




1. Backend Installation & Execution
Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000



Interactive Swagger Docs: http://127.0.0.1:8000/docs

ReDoc Alternative: http://127.0.0.1:8000/redoc

2. Frontend Installation & Execution
Bash
cd frontend
npm install
npm run dev


Local Development Client: http://localhost:5173

💡 Key Implementation Features
Optimized Product Detail View: Implements granular component states, dynamic gallery management, stock validation banners, and multi-tabbed specifications/reviews interface.

Reusable UI Primitives: Includes robust async loading indicators (Loader.jsx) supporting both inline mounting and full-screen modal overlays.

Enterprise Error Handling: Standardized API error responses and robust frontend validation safeguards.

📄 License
Distributed under the MIT License. See LICENSE for more information.
