// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, TouchableOpacity, FlatList, Linking, StyleSheet, Dimensions } from 'react-native';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';

// interface Pdf {
//   title: string;
//   url: string;
//   thumbnail?: string; // Add thumbnail support
// }

// const pdfData: Pdf[] = [
//   { 
//     title: 'PDF 1', 
//     url: 'https://drive.google.com/file/d/17AYHLzgc7_PTEuNbz2kBRqFy-PMmvLG8/view?usp=sharing', 
//     thumbnail: 'https://via.placeholder.com/150' // Replace with actual thumbnail URL
//   },
//   { 
//     title: 'PDF 2', 
//     url: 'https://drive.google.com/file/d/1gJD-KX7jJRMANyrn7P361MeZY6a6s-xM/view?usp=sharing',
//     thumbnail: 'https://via.placeholder.com/150' // Replace with actual thumbnail URL
//   }
// ];

// const PdfCard: React.FC<Pdf> = ({ title, url, thumbnail }) => {
//   return (
//     <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.cardContainer}>
//       {thumbnail ? (
//         <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
//       ) : (
//         <Text style={styles.loadingText}>No Preview Available</Text>
//       )}
//       <Text style={styles.pdfTitle}>{title}</Text>
//     </TouchableOpacity>
//   );
// };

// const PdfScreen: React.FC = () => {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={<Image source={require('../../assets/images/rishikulbhaktmandal.jpg')} style={styles.fullImage} />}
//     >
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText style={styles.titleText}>PDFs</ThemedText>
//       </ThemedView>

//       {/* Render PDF List */}
//       <FlatList
//         data={pdfData}
//         renderItem={({ item }) => <PdfCard {...item} />}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.flatListContainer}
//       />
//     </ParallaxScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   titleContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//   },
//   titleText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'red',
//     textAlign: 'center',
//   },
//   fullImage: {
//     width: '100%',
//     height: 250,
//     resizeMode: 'contain',
//   },
//   flatListContainer: {
//     paddingHorizontal: 15, // Adds space on both sides
//     paddingBottom: 20,
//   },
//   cardContainer: {
//     width: '100%', // Ensures proper alignment
//     marginVertical: 10,
//     padding: 15,
//     borderWidth: 1,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     borderColor: '#ddd',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 3, // Adds shadow for Android
//   },
//   thumbnail: {
//     width: '100%',
//     height: 180,
//     borderRadius: 8,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     resizeMode: 'contain',
//   },
//   pdfTitle: {
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#333',
//   },
//   loadingText: {
//     fontSize: 14,
//     color: 'gray',
//     textAlign: 'center',
//   },
// });

// export default PdfScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Linking, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';

// ✅ Your Google Sheets CSV Link
const PDF_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDc7WHEmYh0-74Zsymd4C-it1MjgthyD0rAtpbnrEOOhfnJQuedzrSCQ0hTn_oEN8kLs1REy2UO2Z7/pub?output=csv';

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
            thumbnail: columns[2]?.trim() || 'https://via.placeholder.com/150', // Default thumbnail
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
