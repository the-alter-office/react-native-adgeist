import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';
import ContentContainer from './ContentContainer';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="689db1dfd22d70ae37580333"
      apiKey="0f296c9cb61b42dd1cbccdce2ec88fbc74ed327bef71fbfecc899cbfc480aea3"
      isTestEnvironment={true}
      domain="https://altergame.click"
      customAdgeistApiOrigin="bg-services-qa-api.adgeist.ai"
    >
      <ContentContainer />
    </AdgeistProvider>
  );
}
