import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';
import ContentContainer from './ContentContainer';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="686e31ebff39dc4d5a674b92"
      apiKey="47bffe2e47da3fa46175806897406e3d18cf6a2dcd29e997de650cd839d6acab"
      isTestEnvironment={true}
      domain="https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com/"
      customAdgeistApiOrigin="bg-services-qa-api.adgeist.ai"
    >
      <ContentContainer />
    </AdgeistProvider>
  );
}
