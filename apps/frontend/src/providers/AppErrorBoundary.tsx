import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { ErrorState } from "@/components/ErrorState";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled application error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState title="Unexpected error" description="Something went wrong. Please reload the page." />;
    }

    return this.props.children;
  }
}
