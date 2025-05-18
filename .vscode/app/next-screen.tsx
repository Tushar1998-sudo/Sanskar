import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, SafeAreaView, StyleSheet, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import { Video, Audio, ResizeMode } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

const NextScreen = () => {
  const videoRef = useRef<Video>(null);
  const soundObject = useRef(new Audio.Sound());
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [level, setLevel] = useState(0);
  const [highestRecord, setHighestRecord] = useState(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true); // Sound state

  // Function to Play Sound
  const playSound = async () => {
    try {
      await soundObject.current.loadAsync(require('@/assets/sounds/background.mp3'), { shouldPlay: true });
      await soundObject.current.setIsLoopingAsync(true);
      setIsSoundPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Function to Pause/Resume Sound
  const toggleSound = async () => {
    try {
      if (isSoundPlaying) {
        await soundObject.current.pauseAsync();
      } else {
        await soundObject.current.playAsync();
      }
      setIsSoundPlaying(!isSoundPlaying);
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };

  // Function to Stop Sound
  const stopSound = async () => {
    try {
      await soundObject.current.stopAsync();
      await soundObject.current.unloadAsync();
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (running) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running]);

  // Level Up Every 1 Minute
  useEffect(() => {
    if (timer % 60 === 0 && timer !== 0) {
      setLevel((prev) => prev + 1);
      Alert.alert('Level Up!', `Congratulations! You reached Level ${level + 1}`);
    }

    // Update Highest Record
    if (timer > highestRecord) {
      setHighestRecord(timer);
    }
  }, [timer]);

  // Handle Screen Focus
  useFocusEffect(
    useCallback(() => {
      videoRef.current?.playAsync();
      playSound();

      return () => {
        videoRef.current?.pauseAsync();
        stopSound();
        setRunning(false);
        setTimer(0);
        setLevel(0);
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Video
        ref={videoRef}
        source={require('@/assets/videos/myvideo.mp4')}
        style={styles.video}
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
      />
      <View style={styles.overlay}>
        <Text style={styles.timerText}>
          Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
        <Text style={styles.levelText}>Level: {level}</Text>
        <Text style={styles.recordText}>Highest Record: {Math.floor(highestRecord / 60)} min</Text>

        {/* Timer Start / Stop */}
        {!running ? (
          <TouchableOpacity style={styles.button} onPress={() => setRunning(true)}>
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={() => setRunning(false)}>
            <Text style={styles.buttonText}>Stop Timer</Text>
          </TouchableOpacity>
        )}

        {/* Pause / Resume Sound */}
        <TouchableOpacity style={styles.button} onPress={toggleSound}>
          <Text style={styles.buttonText}>{isSoundPlaying ? 'Pause Sound' : 'Resume Sound'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width: width,
    height: height - 50, // Adjust for tab bar
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    gap: 15, // Better spacing
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
    backgroundColor: '#FF4500', // Red for Stop button
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NextScreen;
