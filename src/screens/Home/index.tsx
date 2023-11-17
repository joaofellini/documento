import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";

import { api } from "../../services/api";

import { styles } from "./styles";

import { Item, ItemProps } from "../../components/Item";
import { Button } from "../../components/Button";

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemProps[]>([]);

  async function handleSelectImage() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        return Alert.alert("é necessario concender a sua permissão ");
      }

      setIsLoading(true);

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [10, 6],
        quality: 1,
      });

      if (response.canceled) {
        return setIsLoading(false);
      }
      if (!response.canceled) {
        const imgManipuled = await ImageManipulator.manipulateAsync(
          response.assets[0].uri,
          [{ resize: { width: 1000 } }],
          {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );
        setSelectedImageUri(imgManipuled.uri);
        docDetect(imgManipuled.base64);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function docDetect(imageBase64: string | undefined) {
    const response = await api.post(
      `/v2/models/${process.env.EXPO_PUBLIC_API_MODEL_ID}/versions/${process.env.EXPO_PUBLIC_API_MODEL_VERSION_ID}/outputs`,
      {
        user_app_id: {
          user_id: process.env.EXPO_PUBLIC_API_USER_ID,
          app_id: process.env.EXPO_PUBLIC_API_APP_ID,
        },
        inputs: [
          {
            data: {
              image: {
                base64: imageBase64,
              },
            },
          },
        ],
      }
    );
    const doc = response.data.outputs[0].data.concepts.map((concept: any) => {
      return {
        name: concept.name,
        percentage: `${Math.round(concept.value * 100)}%`,
      };
    });
    setItems(doc);
    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectImage} disabled={isLoading} />

      {selectedImageUri ? (
        <Image
          source={{ uri: selectedImageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.description}>
          Selecione a foto para analizar.
        </Text>
      )}

      <View style={styles.bottom}>
       

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 24 }}
        >
          <View style={styles.items}>
            {items.map((item) => (
              <Item key={item.name} data={item } />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
