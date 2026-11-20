import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { IVideoSource } from '../types/content';

type PlayerSurfaceProps = { source: IVideoSource };

export function PlayerSurface({ source }: PlayerSurfaceProps) {
  const player = useVideoPlayer(source.url, (instance) => {
    instance.play();
  });

  return (
    <View style={styles.frame}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        nativeControls
        contentFit="contain"
        allowsPictureInPicture
        testID="content-video"
      />
      {source.isLive ? (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.black },
  liveBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.live, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  liveText: { color: colors.text, fontSize: 11, fontWeight: '800' },
});
