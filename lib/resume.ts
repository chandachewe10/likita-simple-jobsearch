import { Platform, Linking, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export const RESUME_ACCEPT_TYPES = [
  'application/pdf',
  '.pdf',
  'application/msword',
  '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.docx',
];

/** Keep under typical browser localStorage limits when storing base64 in AsyncStorage. */
export const MAX_RESUME_BYTES = 2 * 1024 * 1024;
/** Base64 data URLs are larger than raw bytes; guard persisted JSON size on web. */
export const MAX_RESUME_STORAGE_CHARS = 3 * 1024 * 1024;

export type ResumeFile = { uri: string; name: string; size?: number };

export async function pickResume(): Promise<ResumeFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: RESUME_ACCEPT_TYPES,
      copyToCacheDirectory: Platform.OS !== 'web',
    });
    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_RESUME_BYTES) {
      Alert.alert('File too large', 'Please choose a resume under 2 MB.');
      return null;
    }

    return { uri: asset.uri, name: asset.name, size: asset.size };
  } catch {
    Alert.alert('Error', 'Could not pick document');
    return null;
  }
}

export async function openResume(uri: string, fileName?: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') {
      throw new Error('Unable to open resume in this environment.');
    }

    const popup = window.open(uri, '_blank', 'noopener,noreferrer');
    if (popup) return;

    const link = document.createElement('a');
    link.href = uri;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (fileName) link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const supported = await Linking.canOpenURL(uri);
  if (supported) {
    await Linking.openURL(uri);
    return;
  }
  throw new Error('Unable to open this resume file.');
}
