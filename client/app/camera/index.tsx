import React, { useState, useRef, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, Alert, Dimensions } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  if (!permission) {
    return <Box className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Box className="flex-1 justify-center items-center px-4">
          <Text className="text-typography-white text-center text-lg mb-4">
            We need your permission to show the camera
          </Text>
          <TouchableOpacity onPress={requestPermission}>
            <Box className="bg-blue-500 px-6 py-3 rounded-full">
              <Text className="text-white font-medium">Grant Permission</Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          router.push({
            pathname: "/edit-photo",
            params: { imageUri: photo.uri },
          });
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        <SafeAreaView>
          <Box className="absolute top-0 left-0 right-0 z-10">
            <Box className="flex-row justify-between items-center p-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Box className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                  <Text className="text-white text-xl">←</Text>
                </Box>
              </TouchableOpacity>

              <Text className="text-white font-bold text-lg">Camera</Text>

              <Box className="w-10 h-10" />
            </Box>
          </Box>
        </SafeAreaView>

        <Box className="absolute bottom-0 left-0 right-0">
          <SafeAreaView>
            <Box className="pb-8">
              <Box className="flex-row justify-center items-center px-8 mb-4">
                <TouchableOpacity className="flex-1 items-start">
                  <Box className="w-12 h-12 bg-black/50 rounded-full items-center justify-center">
                    <Ionicons name="flash" size={28} color="#fff" />
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity onPress={takePicture} disabled={isCapturing}>
                  <Box
                    className="w-20 h-20 border-4 border-white rounded-full items-center justify-center"
                    style={{ opacity: isCapturing ? 0.5 : 1 }}
                  >
                    <Box className="w-16 h-16 bg-white rounded-full" />
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 items-end" onPress={toggleCameraFacing}>
                  <Box className="w-12 h-12 bg-black/50 rounded-full items-center justify-center">
                    <MaterialCommunityIcons name="camera-flip" size={28} color="#fff" />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          </SafeAreaView>
        </Box>
      </CameraView>
    </SafeAreaView>
  );
}
