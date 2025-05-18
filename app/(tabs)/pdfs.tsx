import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';

// ✅ Your Google Sheets CSV Link
const PDF_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIGLEWzgRWABO-RfCA1hq2hkukWxz5IgZ6ku-Bwh925lASV2wT1OzMWupnB61NjNhguC_gWmBT7TfU/pub?gid=707059208&single=true&output=csv';

// ✅ Define the PDF interface
interface Pdf {
  title: string;
  url: string;
  thumbnail: string;
}

// ✅ PDF Card Component
const PdfCard: React.FC<Pdf> = ({ title, url, thumbnail }) => {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.cardContainer}>
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      ) : (
        <Text style={styles.loadingText}>No Preview Available</Text>
      )}
      <Text style={styles.pdfTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

// ✅ PDF Screen Component
const PdfScreen: React.FC = () => {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(2);

  // ✅ Fetch PDF Data from Google Sheet
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const response = await axios.get(PDF_SHEET_URL);
        const data = response.data;
        const rows = (data as string).split('\n').slice(1); // Remove header row
    
        const parsedPdfs: Pdf[] = rows.map((row: string) => {
          const columns = row.split(',');
          return {
            title: columns[0]?.trim() || 'No Title',
            url: columns[1]?.trim() || '',
            thumbnail: columns[2]?.trim() || '', // Default thumbnail
          };
        }).filter((pdf: Pdf) => pdf.url !== ''); // ✅ Explicitly defining pdf as type Pdf
    
        setPdfs(parsedPdfs);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchPdfs();
  }, []);

  // ✅ Responsive Layout: Adjust number of columns based on screen size
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
        <ThemedText style={styles.titleText}>PDFs</ThemedText>
      </ThemedView>

      {/* ✅ Show Loader While Fetching Data */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          key={numColumns}
          data={pdfs}
          renderItem={({ item }) => <PdfCard {...item} />}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </ParallaxScrollView>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  fullImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  flatListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    margin: 10,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Android shadow effect
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    resizeMode: 'contain',
  },
  pdfTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  loadingText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});

export default PdfScreen;
