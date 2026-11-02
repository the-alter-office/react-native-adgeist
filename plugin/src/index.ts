import {
  type ConfigPlugin,
  createRunOncePlugin,
  withPlugins,
} from '@expo/config-plugins';

import { withRNAdgeistAppDelegate } from './ios/withRNAdgeistAppDelegate';
import { withAdgeistAppId } from './withAdgeistAppId';

type AdgeistPluginProps = { adgeistAppId?: string } | void;

/**
 * So, expo config plugin are awesome and the documentation is well written, but I still needed to look around to see
 * how other projects actually modify the AppDelegate. I've found react-native-firebase to implement a plugin config
 * that changes the AppDelegate, so I'll leave their link as reference:
 * https://github.com/invertase/react-native-firebase/blob/main/packages/app/plugin/src/ios/appDelegate.ts
 *
 * Kudos to them, because this stuff is hard!
 *
 * @param config
 */
const withRNAdgeist: ConfigPlugin<AdgeistPluginProps> = (config, props) => {
  const adgeistAppId = props?.adgeistAppId;
  if (!adgeistAppId) {
    throw new Error(
      '[@thealteroffice/react-native-adgeist] "adgeistAppId" is required in the config plugin options.'
    );
  }

  return withPlugins(config, [
    //iOS
    withRNAdgeistAppDelegate,

    [withAdgeistAppId, { adgeistAppId }],
  ]);
};

const pak = require('@thealteroffice/react-native-adgeist/package.json');
export default createRunOncePlugin(withRNAdgeist, pak.name, pak.version);
