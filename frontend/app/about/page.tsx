import { redirect } from 'next/navigation';

// The Methodology page has been removed.
// Redirect any direct visits to the Command Center.
export default function About() {
  redirect('/dashboard');
}
