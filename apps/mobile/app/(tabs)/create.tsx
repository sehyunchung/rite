import { Redirect } from 'expo-router';

// This tab just redirects to the create event screen
export default function CreateTab() {
  return <Redirect href="/create-event" />;
}
