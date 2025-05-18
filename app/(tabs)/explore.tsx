import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const YOUTUBE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIGLEWzgRWABO-RfCA1hq2hkukWxz5IgZ6ku-Bwh925lASV2wT1OzMWupnB61NjNhguC_gWmBT7TfU/pub?output=csv';

interface Video {
  title: string;
  url: string;
  thumbnail: string;
}

const getThumbnailUrl = (url: string): string => {
  if (!url) return '';

  // Handle Google Drive URLs
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([^/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}=s500`; // Google's thumbnail proxy
  }

  // Handle YouTube URLs
  const ytMatch = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(&v=))([^#&?]{11}).*/);
  if (ytMatch && ytMatch[8]) {
    return `https://img.youtube.com/vi/${ytMatch[8]}/0.jpg`;
  }

  // Return original URL if not Drive or YouTube
  return url;
};



const YouTubeCard: React.FC<Video> = ({ title, url, thumbnail }) => {
  const displayThumbnail = thumbnail?.trim() || getThumbnailUrl(url);
  const displayTitle = title?.trim() || 'Untitled';
  console.log('Resolved thumbnail:', displayThumbnail)

  return (
    <TouchableOpacity 
      onPress={() => Linking.openURL(url)} 
      style={styles.cardContainer}
    >
      {displayThumbnail ? (
        <Image 
          source={{ uri: displayThumbnail }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text>No Thumbnail</Text>
        </View>
      )}
      <Text style={styles.videoTitle} numberOfLines={2}>
        {displayTitle}
      </Text>
    </TouchableOpacity>
  );
};

const YouTubeScreen: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(2);
  const [listKey, setListKey] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(YOUTUBE_SHEET_URL);
        const parsedData = Papa.parse<Record<string, string>>(response.data, { 
          header: true,
          skipEmptyLines: true,
        });

        const parsedVideos = parsedData.data
          .map(row => ({
            title: row.title?.trim() || '',
            url: row.url?.trim() || '',
            thumbnail: row.thumbnail?.trim() || '',
          }))
          .filter(video => video.url);

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
      const newNumColumns = screenWidth > 600 ? 2 : 1;
      
      if (newNumColumns !== numColumns) {
        setNumColumns(newNumColumns);
        setListKey(prev => prev + 1); // Force re-render
      }
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    updateLayout();
    
    return () => subscription?.remove();
  }, [numColumns]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image 
          source={require('../../assets/images/rishikulbhaktmandal.jpg')} 
          style={styles.fullImage} 
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.titleText}>YouTube Videos</ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : videos.length > 0 ? (
        <FlatList
          key={`flatlist-${numColumns}-${listKey}`} // Unique key for re-renders
          data={videos}
          renderItem={({ item }) => <YouTubeCard {...item} />}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          numColumns={numColumns}
          contentContainerStyle={styles.flatListContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No videos available</Text>
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
    resizeMode: 'cover',
  },
  flatListContainer: {
    padding: 10,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    maxWidth: '100%',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 5,
    marginBottom: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 16/9,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default YouTubeScreen;