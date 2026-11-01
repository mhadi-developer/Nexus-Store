# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Docker

Build the production image from the repository root. Set `VITE_BACKEND_URL`
to the API URL reachable by the user's browser; it is embedded at build time.

```powershell
docker build --build-arg VITE_BACKEND_URL=http://localhost:8000/api -t nexus-frontend ./frontend
docker run --rm -p 5173:8080 nexus-frontend
```

Open `http://localhost:5173`. The image builds the Vite app in a Node stage and
serves the static output with unprivileged Nginx.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
