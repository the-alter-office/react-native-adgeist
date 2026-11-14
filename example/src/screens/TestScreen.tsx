import {
  HTML5AdView,
  HTML5AdViewPreview,
} from '@thealteroffice/react-native-adgeist';
import { SAMPLE_FONT_URL, SAMPLE_STYLE_OPTIONS } from '../sampleStyle';
import { StyleSheet, ScrollView } from 'react-native';

export default function TestScreen() {
  return (
    <ScrollView
      style={styles.container}
      horizontal={false}
      contentContainerStyle={styles.content}
    >
      <HTML5AdView
        adUnitID="6af826c8ef8b64fcb54effd2"
        styleOptions={SAMPLE_STYLE_OPTIONS}
        fontUrl={SAMPLE_FONT_URL}
        adSize={{ width: 360, height: 360 }}
        reserveSpace={true}
      />

      <HTML5AdView
        adUnitID="6af826ebef8b64fcb54f001e"
        styleOptions={SAMPLE_STYLE_OPTIONS}
        fontUrl={SAMPLE_FONT_URL}
        adSize={{ height: 300 }}
        adIsResponsive={true}
        reserveSpace={true}
      />

      <HTML5AdView
        adUnitID="6af8272f8ff4f7972ac9cac6"
        styleOptions={SAMPLE_STYLE_OPTIONS}
        fontUrl={SAMPLE_FONT_URL}
        adIsResponsive={true}
        adSize={{ height: 350 }}
      />

      <HTML5AdViewPreview
        styleOptions={SAMPLE_STYLE_OPTIONS}
        fontUrl={SAMPLE_FONT_URL}
        adSize={{ width: 360, height: 360 }}
        type="banner"
      ></HTML5AdViewPreview>

      <HTML5AdViewPreview
        styleOptions={SAMPLE_STYLE_OPTIONS}
        fontUrl={SAMPLE_FONT_URL}
        adSize={{ height: 360 }}
        type="display"
      ></HTML5AdViewPreview>

      <HTML5AdViewPreview
        styleOptions={SAMPLE_STYLE_OPTIONS}
        fontUrl={SAMPLE_FONT_URL}
        adSize={{ height: 360 }}
        type="companion"
      ></HTML5AdViewPreview>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
