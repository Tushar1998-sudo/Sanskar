import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Linking, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import Papa from 'papaparse'; // Ensure you have this package installed

const YOUTUBE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSb89Gl2HHcXb1C6jSAVd9XBXjlKOB0pWuSZ6zOc9W8zDypnlWlR1CWHSMJQT4LRtHUIM__PrkESpZA/pub?output=csv';

const getThumbnailUrl = (url: string): string => {
  const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=))([\w-]{11})/;
  const match = url.match(regex);
  return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : '';
};

interface Video {
  title: string;
  url: string;
}

const YouTubeCard: React.FC<Video> = ({ title, url }) => {
  const thumbnailUrl = getThumbnailUrl(url);
  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.cardContainer}>
      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      <Text style={styles.videoTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const YouTubeScreen: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get<string>(YOUTUBE_SHEET_URL); // ✅ Explicitly define response type
        const parsedData = Papa.parse<Video>(response.data, { header: true }); // ✅ Parse CSV properly

        const parsedVideos: Video[] = parsedData.data
          .map((row) => ({
            title: row.title?.trim() || 'No Title',
            url: row.url?.trim() || '',
          }))
          .filter((video) => video.url);

        setVideos(parsedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const screenWidth = Dimensions.get('window').width;
      setNumColumns(screenWidth > 600 ? 2 : 1);
    };
    const subscription = Dimensions.addEventListener('change', updateLayout);
    updateLayout();
    return () => subscription?.remove();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Image source={require('../../assets/images/rishikulbhaktmandal.jpg')} style={styles.fullImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.titleText}>YouTube Videos</ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          key={numColumns}
          data={videos}
          renderItem={({ item }) => <YouTubeCard title={item.title} url={item.url} />}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
  },
  fullImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  flatListContainer: {
    padding: 10,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: 'black',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
  },
  videoTitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default YouTubeScreen;
