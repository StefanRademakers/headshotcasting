import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

type ErrorBoundaryState = {
  errorMessage: string | null;
};

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    errorMessage: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      errorMessage: error.message || "Unknown runtime error"
    };
  }

  componentDidCatch(error: Error) {
    console.error("App runtime error", error);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <main className="app crashScreen">
          <section className="panel crashPanel">
            <h1>Runtime error</h1>
            <p>The app hit a render error instead of loading normally.</p>
            <pre>{this.state.errorMessage}</pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
