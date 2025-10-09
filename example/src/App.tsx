import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';
import ContentContainer from './ContentContainer';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="68e4baa14040394a656d5262"
      apiKey="48ad37bbe0c4091dee7c4500bc510e4fca6e7f7a1c293180708afa292820761c"
      isTestEnvironment={true}
      domain="https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com"
    >
      <ContentContainer />
    </AdgeistProvider>
  );
}
