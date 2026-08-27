import { Component, type ErrorInfo, type ReactNode } from "react";
import CommonButton from "../ui/buttons/CommonButton";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  failed: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center"
      >
        <h1 className="font-fantasy-decorative text-3xl text-gold">
          The spell fizzled
        </h1>
        <p className="max-w-md text-sm text-faint">
          Something in the interface stopped working. Nothing you were looking at
          was saved to the campaign, so reloading is safe.
        </p>
        <CommonButton onClick={() => window.location.reload()}>
          Reload the page
        </CommonButton>
      </div>
    );
  }
}

export default ErrorBoundary;
