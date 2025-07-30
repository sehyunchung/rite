import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ScrollView 
          style={{ flex: 1, backgroundColor: '#FEF2F2' }}
          contentContainerStyle={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View style={{ alignItems: 'center', maxWidth: 300 }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#DC2626', 
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Something went wrong
            </Text>
            
            <Text style={{ 
              fontSize: 16, 
              textAlign: 'center', 
              color: '#6B7280', 
              marginBottom: 24,
              lineHeight: 24,
            }}>
              We're sorry, but an unexpected error occurred. Please restart the app or contact support if the problem persists.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={{ 
                backgroundColor: '#F3F4F6',
                padding: 12,
                borderRadius: 8,
                width: '100%',
                marginTop: 16,
              }}>
                <Text style={{ 
                  fontSize: 12, 
                  fontFamily: 'monospace',
                  color: '#374151',
                  marginBottom: 8,
                  fontWeight: 'bold',
                }}>
                  Error Details (Development Mode):
                </Text>
                <Text style={{ 
                  fontSize: 10, 
                  fontFamily: 'monospace',
                  color: '#6B7280',
                }}>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={{ 
                    fontSize: 9, 
                    fontFamily: 'monospace',
                    color: '#9CA3AF',
                    marginTop: 8,
                  }}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;