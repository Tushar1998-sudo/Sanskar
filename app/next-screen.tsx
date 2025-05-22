import { useFocusEffect } from '@react-navigation/native';
import { Audio, ResizeMode, Video } from 'expo-av';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const NextScreen = () => {
  const videoRef = useRef<Video>(null);
  const soundObject = useRef(new Audio.Sound());
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [level, setLevel] = useState(0);
  const [highestRecord, setHighestRecord] = useState(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  // Load sound once on mount
  useEffect(() => {
    const loadSound = async () => {
      try {
        await soundObject.current.loadAsync(
          require('@/assets/sounds/background.mp3'), // <-- Make sure this path and filename is correct!
          { shouldPlay: true, isLooping: true }
        );
        setIsSoundLoaded(true);
        setIsSoundPlaying(true);
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    return () => {
      soundObject.current.unloadAsync();
    };
  }, []);

  // Toggle play/pause sound
  const toggleSound = async () => {
    if (!isSoundLoaded) return;

    try {
      if (isSoundPlaying) {
        await soundObject.current.pauseAsync();
        setIsSoundPlaying(false);
      } else {
        await soundObject.current.playAsync();
        setIsSoundPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };

  // Timer effect
useEffect(() => {
  let interval: ReturnType<typeof setInterval> | undefined;

  if (running) {
    interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }

  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}, [running]);

  // Level up and record check
  useEffect(() => {
    if (timer !== 0 && timer % 60 === 0) {
      setLevel((prev) => prev + 1);
      Alert.alert('Level Up!', `Congratulations! You reached Level ${level + 1}`);
    }

    if (timer > highestRecord) {
      setHighestRecord(timer);
    }
  }, [timer]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') {
        videoRef.current?.playAsync();
      }
      setRunning(true); // start timer automatically when screen focused

      return () => {
        if (Platform.OS !== 'web') {
          videoRef.current?.pauseAsync();
        }
        setRunning(false);
        setTimer(0);
        setLevel(0);
      };
    }, [])
  );

  return (
    <>
      <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
      <SafeAreaView style={styles.container}>
        {Platform.OS !== 'web' ? (
          <Video
            ref={videoRef}
            source={require('@/assets/videos/myvideo.mp4')}
            style={styles.video}
            shouldPlay
            isLooping
            resizeMode={ResizeMode.COVER}
          />
        ) : (
          <video
            src={require('@/assets/videos/myvideo.mp4')}
            style={styles.video}
            autoPlay
            loop
          />
        )}

        <View style={styles.overlay}>
          <Text style={styles.timerText}>
            Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.levelText}>Level: {level}</Text>
          <Text style={styles.recordText}>Highest Record: {Math.floor(highestRecord / 60)} min</Text>

          {!running ? (
            <TouchableOpacity style={styles.button} onPress={() => setRunning(true)}>
              <Text style={styles.buttonText}>Start Timer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={() => setRunning(false)}>
              <Text style={styles.buttonText}>Stop Timer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={toggleSound}>
            <Text style={styles.buttonText}>{isSoundPlaying ? 'Pause Sound' : 'Resume Sound'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  timerText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 20,
    color: 'yellow',
    marginBottom: 10,
  },
  recordText: {
    fontSize: 18,
    color: 'cyan',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: '#FF4500',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NextScreen;
