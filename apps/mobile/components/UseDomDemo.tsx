import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { CrossPlatformButton as Button } from './ui';

// Conditional imports based on platform
const QRCode = Platform.OS === 'web' 
  ? require('@rite/ui/src/components/qr-code/qr-code.dom').QRCode
  : require('@rite/ui/src/components/qr-code/qr-code.native').QRCode;

const Dropzone = Platform.OS === 'web'
  ? require('@rite/ui/src/components/dropzone/dropzone.dom').Dropzone
  : require('@rite/ui/src/components/dropzone/dropzone.native').Dropzone;

export default function UseDomDemo() {
  const [qrData, setQrData] = useState('https://rite.dj/demo');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
  };

  return (
    <View className="p-6 space-y-6 bg-neutral-800 min-h-screen">
      <Text className="text-2xl font-bold text-white mb-4">
        "use dom" Demo Components
      </Text>
      
      {/* Platform indicator */}
      <View className="p-4 bg-neutral-700 rounded-lg">
        <Text className="text-white">
          Platform: {Platform.OS}
        </Text>
        <Text className="text-neutral-400 text-sm">
          {Platform.OS === 'web' 
            ? 'Using DOM components with "use dom" directive' 
            : 'Using React Native fallback components'
          }
        </Text>
      </View>

      {/* QR Code Demo */}
      <View className="space-y-2">
        <Text className="text-lg font-semibold text-white">QR Code Component</Text>
        <View className="bg-neutral-700 p-4 rounded-lg items-center">
          <QRCode
            data={qrData}
            foreground="#E946FF"
            background="#FFFFFF"
            className="mb-4"
          />
          <Button
            onAction={() => setQrData(`https://rite.dj/event/${Date.now()}`)}
            size="sm"
          >
            Generate New QR
          </Button>
        </View>
        <Text className="text-neutral-400 text-sm">
          {Platform.OS === 'web' 
            ? 'Generated using QR library with DOM canvas rendering'
            : 'Placeholder implementation - would need react-native-qrcode-svg'
          }
        </Text>
      </View>

      {/* Dropzone Demo */}
      <View className="space-y-2">
        <Text className="text-lg font-semibold text-white">Dropzone Component</Text>
        <View className="bg-neutral-700 p-4 rounded-lg">
          <Dropzone
            onDrop={handleFileUpload}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            maxFiles={3}
            maxSize={5 * 1024 * 1024} // 5MB
            className="min-h-32"
          >
            <Text className="text-center text-white">
              {uploadedFiles.length > 0 
                ? `${uploadedFiles.length} file(s) selected`
                : 'Drop images here or tap to select'
              }
            </Text>
          </Dropzone>
        </View>
        <Text className="text-neutral-400 text-sm">
          {Platform.OS === 'web' 
            ? 'Native HTML5 drag-and-drop with file validation'
            : 'Placeholder implementation - would need expo-document-picker'
          }
        </Text>
      </View>

      {/* Benefits explanation */}
      <View className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
        <Text className="text-brand-primary font-semibold mb-2">
          Benefits of "use dom"
        </Text>
        <Text className="text-white text-sm leading-relaxed">
          • Enables direct use of web APIs and DOM manipulation{'\n'}
          • Reduces platform-specific code duplication{'\n'}
          • Better performance than WebView for complex interactions{'\n'}
          • Access to mature web libraries and ecosystem{'\n'}
          • Seamless integration with existing React Native code
        </Text>
      </View>
    </View>
  );
}