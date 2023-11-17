import { StatusBar } from 'expo-status-bar';


import { Home } from './src/screens/Home';
import { Loading } from './src/components/Loading';

export default function App() {
 

  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor="transparent"
        translucent
      />

      <Home />
    </>
  );
}