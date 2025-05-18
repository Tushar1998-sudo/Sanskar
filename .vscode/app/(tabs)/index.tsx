import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  SafeAreaView, 
  StyleSheet, 
  Button 
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import ParallaxScrollView from '@/components/ParallaxScrollView';
// Google Sheets CSV Links
const QUOTES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSXUCeMHCYlX5fxJ3KvNjkuAsykeWoplDY41grk51A2k8Iqxksbz5nBD7bz66m6F5hkQnWBVB1EhDn/pub?gid=0&single=true&output=csv';
const IMAGES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSXUCeMHCYlX5fxJ3KvNjkuAsykeWoplDY41grk51A2k8Iqxksbz5nBD7bz66m6F5hkQnWBVB1EhDn/pub?gid=1&single=true&output=csv';

const { width, height } = Dimensions.get('window');
const IMAGE_ASPECT_RATIO = 1;

// Quote Interface
interface Quote {
  quote: string;
  author: string;
  category: string;
}

const HomeScreen: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get(QUOTES_SHEET_URL);
        const data = response.data as unknown as string;
        const rows = (data as string).split('\n').slice(1); // Remove Header Row

        const parsedQuotes: Quote[] = rows.map((row: string) => {
          const columns = row.split(',');
          return {
            quote: columns[0] || 'No quote available',
            author: columns[1] || 'Unknown',
            category: columns[2] || 'Unknown',
          };
        });

        setQuotes(parsedQuotes);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [quotes]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(IMAGES_SHEET_URL);
        const data = response.data;
        const rows = (data as string).split('\n').slice(1); // Remove Header Row
        setImages(rows.map((row: string) => row.split(',')[0]));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images]);
  return (
    <SafeAreaView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image 
            source={require('@/assets/images/meditation.png')} 
            style={[styles.headerImage, { width: width, height: width / IMAGE_ASPECT_RATIO }]} 
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quotes[currentQuoteIndex]?.quote}"</Text>
            <Text style={styles.authorText}>- {quotes[currentQuoteIndex]?.author}</Text>
            <Text style={styles.authorText}>- {quotes[currentQuoteIndex]?.category}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Go to Next Screen" onPress={() => router.push('/next-screen')} />
        </View>

        <View style={styles.galleryContainer}>
          {images.length > 0 ? (
            <Image source={{ uri: images[currentImageIndex] }} style={styles.galleryIcon} />
          ) : (
            <View style={styles.galleryPlaceholder}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImage: { width, height: height * 0.5, resizeMode: 'cover' },
  loadingIndicator: { marginTop: 20 },
  quoteContainer: { marginVertical: 10, paddingHorizontal: 20 },
  quoteText: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', color: 'black' },
  authorText: { fontSize: 14, textAlign: 'center', marginTop: 5, color: 'gray' },
  buttonContainer: { marginTop: 20, alignItems: 'center' },
  galleryContainer: { position: 'absolute', top: 437, left: 247, width: 128, height: 137, justifyContent: 'center', alignItems: 'center' },
  galleryIcon: { width: '100%', height: '100%', borderWidth: 2, borderColor: 'black' },
  galleryPlaceholder: { width: '100%', height: '100%', backgroundColor: 'white', borderWidth: 2, borderColor: 'black', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: 'black', fontSize: 14 },
});

export default HomeScreen;
