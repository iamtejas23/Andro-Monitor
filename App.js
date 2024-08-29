import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import Animated, { FadeInUp, LightSpeedInLeft } from 'react-native-reanimated';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [batteryState, setBatteryState] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [wifiInfo, setWifiInfo] = useState({});
  const [networkType, setNetworkType] = useState(null);
  const [ipAddress, setIpAddress] = useState(null);
  const [storageInfo, setStorageInfo] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [accelerometerData, setAccelerometerData] = useState({});

  useEffect(() => {
    const getBatteryStatus = async () => {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      setBatteryLevel(level);
      setBatteryState(state);
    };

    const getDeviceInfo = () => {
      setDeviceInfo({
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        totalMemory: Device.totalMemory,
        deviceType: Device.deviceType,
        brand: Device.brand,
        manufacturer: Device.manufacturer,
      });
    };

    const getWifiInfo = async () => {
      const networkState = await Network.getNetworkStateAsync();
      const ip = await Network.getIpAddressAsync();
      const wifiDetails = await NetInfo.fetch();
      setWifiInfo({
        isConnected: networkState.isConnected,
        isWifiEnabled: networkState.isWifiEnabled,
        isInternetReachable: networkState.isInternetReachable,
        ssid: wifiDetails.details?.ssid || 'N/A',
        strength: wifiDetails.details?.strength || 'N/A',
      });
      setNetworkType(networkState.type);
      setIpAddress(ip);
    };

    const getStorageInfo = async () => {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      setStorageInfo({
        freeSpace: (freeSpace / (1024 * 1024 * 1024)).toFixed(2),
        totalSpace: (totalSpace / (1024 * 1024 * 1024)).toFixed(2),
      });
    };

    const subscribeAccelerometer = () => {
      Accelerometer.addListener((data) => {
        setAccelerometerData(data);
      });
    };

    getBatteryStatus();
    getDeviceInfo();
    getWifiInfo();
    getStorageInfo();
    subscribeAccelerometer();

    const batteryLevelListener = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
    });

    const batteryStateListener = Battery.addBatteryStateListener(({ batteryState }) => {
      setBatteryState(batteryState);
    });

    return () => {
      batteryLevelListener.remove();
      batteryStateListener.remove();
      Accelerometer.removeAllListeners();
    };
  }, []);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const themeStyles = {
    backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
    color: isDarkMode ? '#00ff00' : '#000000',
  };

  const progressData = {
    labels: ['CPU', 'Memory', 'Disk'], // optional
    data: [0.4, 0.6, 0.8], // Example data
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.header, { color: themeStyles.color }]}>Andro Monitor</Text>
      <Switch value={isDarkMode} onValueChange={toggleDarkMode} />

      <Animated.View style={styles.infoCard} entering={FadeInUp.delay(100)}>
        <Text style={[styles.infoTitle, { color: themeStyles.color }]}>Device Info</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Model: {deviceInfo.modelName}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>OS: {deviceInfo.osName} {deviceInfo.osVersion}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Total Memory: {(deviceInfo.totalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Device Type: {deviceInfo.deviceType}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Brand: {deviceInfo.brand}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Manufacturer: {deviceInfo.manufacturer}</Text>
      </Animated.View>

      <Animated.View style={styles.infoCard} entering={FadeInUp.delay(200)}>
        <Text style={[styles.infoTitle, { color: themeStyles.color }]}>Battery Info</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Battery Level: {(batteryLevel * 100).toFixed(0)}%</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Battery State: {batteryState === Battery.BatteryState.UNPLUGGED ? 'Unplugged' : batteryState === Battery.BatteryState.CHARGING ? 'Charging' : 'Full'}</Text>
      </Animated.View>

      <Animated.View style={styles.infoCard} entering={FadeInUp.delay(300)}>
        <Text style={[styles.infoTitle, { color: themeStyles.color }]}>WiFi Info</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Connected: {wifiInfo.isConnected ? 'Yes' : 'No'}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>WiFi Enabled: {wifiInfo.isWifiEnabled ? 'Yes' : 'No'}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Internet Reachable: {wifiInfo.isInternetReachable ? 'Yes' : 'No'}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>SSID: {wifiInfo.ssid}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Signal Strength: {wifiInfo.strength}%</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>IP Address: {ipAddress}</Text>
        <Text style={[styles.text, { color: themeStyles.color }]}>Network Type: {networkType}</Text>
      </Animated.View>

      <Animated.View style={styles.chartCard} entering={FadeInUp.delay(400)}>
        <Text style={[styles.chartTitle, { color: themeStyles.color }]}>System Performance</Text>
        <ProgressChart
          data={progressData}
          width={320}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundGradientFrom: themeStyles.backgroundColor,
            backgroundGradientTo: themeStyles.backgroundColor,
            color: () => `#00ff00`,
            labelColor: () => themeStyles.color,
          }}
          hideLegend={false}
        />
      </Animated.View>

      <Animated.View style={styles.chartCard} entering={LightSpeedInLeft.delay(500)}>
        <Text style={[styles.chartTitle, { color: themeStyles.color }]}>CPU Usage Over Time</Text>
        <LineChart
          data={{
            labels: ['1s', '2s', '3s', '4s', '5s'],
            datasets: [
              {
                data: [30, 45, 28, 80, 99],
              },
            ],
          }}
          width={320}
          height={220}
          chartConfig={{
            backgroundColor: themeStyles.backgroundColor,
            backgroundGradientFrom: themeStyles.backgroundColor,
            backgroundGradientTo: themeStyles.backgroundColor,
            decimalPlaces: 2,
            color: () => `#00ff00`,
            labelColor: () => themeStyles.color,
          }}
          bezier
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 70,
    fontFamily: 'monospace',
  },
  infoCard: {
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  text: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  chartCard: {
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
});
