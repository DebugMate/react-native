import React from "react";
import { Button, Text, StyleSheet, ScrollView } from "react-native";
import { useDebugmateContext } from "../Providers/DebugmateProvider";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };

    this.debugmate = useDebugmateContext();
  }

  componentDidMount() {
    this.debugmate.setupGlobalErrorHandling();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.log("Error info:", errorInfo);
    this.debugmate.publish(error);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorDetails}>
            {this.state.errorInfo ? this.state.errorInfo.componentStack : ''}
          </Text>
          <Button
            title="Try again"
            onPress={this.handleTryAgain}
            color="#841584" 
          />
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 50,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDetails: {
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ErrorBoundary;